import {
  extname,
  join,
  relative,
  sep,
} from "path";

import { STypeError } from "@lib/errors";
import { mainLog } from "@lib/mainLog";
import { protocolDeflate, protocolInflate } from "@utils/compression";
import { isDebug } from "@utils/utils";

import { scan } from "fs-nextra";
import ow from "ow";

import VarInt from "./fields/VarInt";
import BufferConsumer from "./BufferConsumer";
import BufferProducer from "./BufferProducer";
import Packet from "./Packet";
import State from "./State";

const log = mainLog.child("packetCodec");

const PACKET_DIR = join(__dirname, "packets");

// Maps a state enum to an object of ids and in turn Packet instances.
interface PacketStateMap {
  [state: number]: {
    [id: number]: Packet;
  };
  noState: {
    [id: number]: Packet;
  };
}

// Maps folder names to state enum values.
const STATE_STRING_MAP: Record<string, State> | Record<string, any> = {
  shake: State.SHAKE,
  stats: State.STATS,
  login: State.LOGIN,
  play: State.PLAY,
  noState: "noState",
};

const packets: PacketStateMap = {
  [State.SHAKE]: {},
  [State.STATS]: {},
  [State.LOGIN]: {},
  [State.PLAY]: {},
  noState: {},
};

// TODO: Make these kind of file loaders more modular, given one similar exists in Marshal.
export async function initPacketCodec() {
  log.debug("Querying packets directory...");
  const files = await scan(PACKET_DIR, {
    filter: (stats, path) => stats.isFile() && extname(path) === (isDebug ? ".ts" : ".js"),
  });

  log.debug("Registering packets...");
  await Promise.all([...files.keys()]
    .map(async loc => {
      const packetName = relative(PACKET_DIR, loc).slice(0, -3);

      const directory = packetName.split(sep);

      const [stateName] = directory.length > 1 ? directory : ["noState"];

      // Packet schemas prefixed with "_" are ignored.
      if ((directory?.[1] ?? packetName).startsWith("_")) return log.debug(`Skipping packet ${packetName}.`);

      const fileObj = await import(loc);

      if (!fileObj.default) return log.warn(`The packet ${packetName} has no default export!`);
      const packet = fileObj.default as Packet;

      if (!(packet instanceof Packet)) return log.error(new STypeError("INVALID_PACKET_SCHEMA", packetName));

      const dir = Packet.getDirection(packet);

      if (dir !== "I") return;

      if (!STATE_STRING_MAP.hasOwnProperty(stateName)) {
        return log.warn(`The packet ${packetName} was placed in a folder which is not a valid state!`);
      }

      const packetState = STATE_STRING_MAP[stateName];

      Packet.setState(packet, packetState);
      packets[packetState][packet.id] = packet;

      log.debug(`Registered packet ${packetName}.`);
    }));

  log.info("Registered all packets!");
}


export async function serialise<P extends Packet>(packet: P, compressThresh: number) {
  try {
    const producer = new BufferProducer();

    for (const [key, fieldData] of Packet.getFields(packet).entries()) {
      // TODO: Probably worth making a function for this, since the code is similar to deserialise.
      const { field, hasDefault } = fieldData;
      const data = packet[key as keyof P];

      if (fieldData.validator) ow(data, fieldData.validator);
      const required = !fieldData.skipFieldOn?.(packet);

      if (!required && !hasDefault) continue;
      const serialised = await field.serialise(data);

      producer.append(serialised);
    }

    // In accordance to wiki.vg, if compression is enabled but a packet does not meet the threshold
    // then the data length should be set to 0. Negative values mean that compression is disabled.
    const compressMode = compressThresh < 0;
    const willCompress = compressMode && producer.byteLength >= compressThresh;
    const dataLength = !compressMode || willCompress ? producer.byteLength : 0;
    const dataLengthBuf = await VarInt.serialise(dataLength);

    if (willCompress) {
      const compressedData = await protocolDeflate(producer.complete());

      producer.replace(compressedData);
    }

    // Set the data length.
    producer.prepend(dataLengthBuf);

    // Set the packet length.
    if (willCompress) producer.prepend(await VarInt.serialise(producer.byteLength));

    return producer.complete();
  } catch (err) {
    // We wouldn't want to terminate the connection now would we?
    log.quickError("An error occurred while serialising a packet!", err);
  }
}

export async function deserialise<P extends Packet>(
  buffer: Buffer,
  state: State,
  compressThresh: number,
): Promise<P | void> {
  const consumer = new BufferConsumer(buffer);

  // Negative values mean that compression is disabled.
  let compressMode = compressThresh >= 0;
  const packetLength = await VarInt.deserialise(consumer);

  // Depending if the packet is compressed or not, the id or data length can be in the same sector of the packet.
  let dataLength = await VarInt.deserialise(consumer);
  let id: number;

  compressMode = compressMode && dataLength !== 0;
  if (compressMode) {
    const remaining = consumer.consume(dataLength);

    // Replace the content with the now decompressed buffer.
    consumer.replaceBuffer(await protocolInflate(remaining));
    id = await VarInt.deserialise(consumer);
  } else {
    // The data length read is actually the id in this case.
    id = dataLength;
    dataLength = packetLength;
  }

  // Get the packet from the packets object.
  const packet = (packets?.[state]?.[id] ?? packets.noState[id]) as P | void;

  // No packet to be mapped :(
  if (!packet) return;

  // Set the hidden properties of packet and data length.
  Packet.setPacketLength(packet, packetLength);
  Packet.setDataLength(packet, dataLength);

  for (const [key, fieldData] of Packet.getFields(packet).entries()) {
    const { field, hasDefault } = fieldData;
    const desVal = await field.deserialise(consumer);

    if (fieldData.validator) ow(desVal, fieldData.validator);

    const required = !fieldData.skipFieldOn?.(packet);

    if (!required && hasDefault) continue;

    packet[key as keyof P] = required ? desVal : void 0;
  }

  return packet;
}
