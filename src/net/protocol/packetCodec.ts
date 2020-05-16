import {
  extname,
  join,
  relative,
  sep,
} from "path";

import { STypeError } from "@lib/errors";
import { mainLog } from "@lib/mainLog";
import { protocolDeflate, protocolInflate } from "@utils/compression";
import Stopwatch from "@utils/Stopwatch";
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

export async function encode<P extends Packet>(packet: P, compressThresh: number) {
  let packetName: string;

  try {
    const stopwatch = new Stopwatch();
    packetName = Packet.getName(packet);

    const producer = new BufferProducer();

    producer.append(await VarInt.encode(packet.id));

    for (const [key, fieldData] of Packet.getFields(packet).entries()) {
      const { field, hasDefault } = fieldData;
      const data = packet[key as keyof P];

      if (fieldData.validator) ow(data, fieldData.validator);
      const required = !fieldData.skipFieldOn?.(packet);

      if (!required && !hasDefault) continue;
      const encoded = await field.encode(data);

      producer.append(encoded);
    }

    // In accordance to wiki.vg, if compression is enabled but a packet does not meet the threshold
    // then the data length should be set to 0. Negative values mean that compression is disabled.
    const compressMode = compressThresh >= 0;
    const willCompress = compressMode && producer.length >= compressThresh;
    const dataLength = !compressMode || willCompress ? producer.length : 0;
    const dataLengthBuf = await VarInt.encode(dataLength);

    if (willCompress) {
      log.debug("Compressing packet...");
      const compressedData = await protocolDeflate(producer.compile());

      producer.replace(compressedData);
    }

    // Set the data length.
    producer.prepend(dataLengthBuf);

    // Set the packet length.
    if (willCompress) producer.prepend(await VarInt.encode(producer.length));

    const comp = producer.compile();

    stopwatch.stop();
    log.debug(`Finished encoding packet ${packetName} in ${stopwatch.toString()}`);

    return comp;
  } catch (err) {
    const packetNoun = packetName ? `the packet ${packetName}` : "a packet";
    log.quickError(`An error occurred while serialising ${packetNoun}`, err);
  }
}

export async function decode<P extends Packet>(
  buffer: Buffer,
  state: State,
  compressThresh: number,
): Promise<P | [P, Buffer] | void> {
  const stopwatch = new Stopwatch();
  const consumer = new BufferConsumer(buffer);

  // Negative values mean that compression is disabled.
  let compressMode = compressThresh >= 0;
  const packetLength = await VarInt.decode(consumer);

  // Depending if the packet is compressed or not, the id or data length can be in the same sector of the packet.
  let dataLength = await VarInt.decode(consumer);
  let id: number;

  compressMode = compressMode && dataLength !== 0;
  if (compressMode) {
    const remaining = consumer.consume(dataLength);

    // Replace the content with the now decompressed buffer.
    consumer.replaceBuffer(await protocolInflate(remaining));
    id = await VarInt.decode(consumer);
  } else {
    // The data length read is actually the id in this case.
    id = dataLength;
    dataLength = packetLength;
  }

  // Get the packet from the packets object.
  const packet = (packets?.[state]?.[id] ?? packets.noState[id]) as P;

  // No packet to be mapped.
  if (!packet) return;

  const packetName = Packet.getName(packet);

  // Set the hidden properties of packet and data length.
  Packet.setPacketLength(packet, packetLength);
  Packet.setDataLength(packet, dataLength);

  for (const [key, fieldData] of Packet.getFields(packet).entries()) {
    const { field, hasDefault } = fieldData;
    const desVal = await field.decode(consumer);

    if (fieldData.validator) ow(desVal, fieldData.validator);

    const required = !fieldData.skipFieldOn?.(packet);

    if (!required && hasDefault) continue;

    packet[key as keyof P] = required ? desVal : void 0;
  }

  stopwatch.stop();

  log.debug(`Finished decoding packet 0x${id.toString(16).toUpperCase()} ${packetName} in ${stopwatch.toString()}`);

  const remaining = consumer.drain();
  if (remaining.length) {
    log.debug("Coalesced packet found");
    return [packet, remaining];
  }

  return packet;
}

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
      if ((directory?.[1] ?? packetName).startsWith("_")) return;

      const fileObj = await import(loc);

      if (!fileObj.default) return log.warn(`The packet ${packetName} has no default export`);
      const packet = fileObj.default as Packet;

      if (!(packet instanceof Packet)) return log.error(new STypeError("INVALID_PACKET", packetName));

      const dir = Packet.getDirection(packet);

      if (dir !== "I") return;

      if (!STATE_STRING_MAP.hasOwnProperty(stateName)) {
        return log.warn(`The packet ${packetName} was placed in a folder which is not a valid state`);
      }

      const packetState = STATE_STRING_MAP[stateName];

      Packet.setState(packet, packetState);

      packets[packetState][packet.id] = packet;

      log.debug(`Registered packet ${packetName}`);
    }));

  log.info("Registered all packets");
}
