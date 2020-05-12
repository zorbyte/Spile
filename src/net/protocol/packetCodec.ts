import {
  extname,
  join,
  relative,
  sep,
} from "path";

import { STypeError } from "@lib/errors";
import { mainLog } from "@lib/mediator";
import { protocolDeflate, protocolInflate } from "@utils/compression";

import { scan } from "fs-nextra";

import VarInt from "./fields/VarInt";
import BufferConsumer from "./BufferConsumer";
import BufferProducer from "./BufferProducer";
import { State } from "./Client";
import Packet from "./Packet";

const log = mainLog.child("packetCodec");

const PACKET_DIR = join(__dirname, "packets");

// Maps a state enum to an object of ids and in turn Packet instances.
interface PacketStateMap {
  [state: number]: {
    [id: number]: Packet;
  };
}

// Inbound and Outbound.
interface PacketMap {
  I: PacketStateMap;
  O: PacketStateMap;
}

const BASE_PACKET_STATE_MAP: PacketStateMap = {
  [State.SHAKE]: {},
  [State.STATS]: {},
  [State.LOGIN]: {},
  [State.PLAY]: {},
};

// Maps folder names to state enum values.
const STATE_STRING_MAP: Record<string, State> = {
  shake: State.SHAKE,
  stats: State.STATS,
  login: State.LOGIN,
  play: State.PLAY,
};

const packets: PacketMap = {
  I: BASE_PACKET_STATE_MAP,
  O: BASE_PACKET_STATE_MAP,
};

// TODO: Make these kind of file loaders more modular, given one similar exists in Marshal.
export async function initPacketCodec() {
  log.info("Querying packets directory...");
  const files = await scan(PACKET_DIR, {
    filter: (stats, path) => stats.isFile() && extname(path) === ".js",
  });

  log.info("Registering packet schemas...");
  await Promise.all([...files.keys()]
    .map(async loc => {
      const packetName = relative(PACKET_DIR, loc).slice(0, -3);

      // Packet schemas prefixed with "_" are ignored.
      if (packetName.startsWith("_")) return;

      const fileObj = await import(loc);

      if (!fileObj.default) return log.warn(`The packet schema ${packetName} has no default export!`);
      const packetSchema = fileObj.default as Packet;

      const [stateName] = packetName.split(sep);

      // eslint-disable-next-line max-len
      if (!(stateName in STATE_STRING_MAP)) return log.warn("A packet was placed in a folder which is not a valid state!");

      if (!(packetSchema instanceof Packet)) return log.error(new STypeError("INVALID_PACKET_SCHEMA", packetName));

      const packetState = STATE_STRING_MAP[stateName];

      Packet.setState(packetSchema, packetState);

      const dir = Packet.getDirection(packetSchema);

      packets[dir][packetState][packetSchema.id] = packetSchema;
      log.debug(`Registered packet schema ${packetName}.`);
    }));

  log.info("Registered all packet schemas!");
}


export async function serialise<P extends Packet>(packet: P, compressThresh: number) {
  try {
    const producer = new BufferProducer();

    for (const [key, field] of Packet.getFields(packet).entries()) {
      const serialised = await field.serialise(packet[key as keyof P]);

      producer.append(serialised);
    }

    // In accordance to wiki.vg, if compression is enabled but a packet does not meet the threshold
    // then the data length should be set to 0. Negative values mean that compression is disabled.
    const compressMode = compressThresh < 0;
    const willCompress = compressMode && producer.byteLength >= compressThresh;
    const dataLength = !compressMode || willCompress ? producer.byteLength : 0;
    const dataLengthBuf = await VarInt.serialise(dataLength);

    if (willCompress) {
      const compressedData = await protocolDeflate(producer.compile());

      producer.replace(compressedData);
    }

    // Set the data length.
    producer.prepend(dataLengthBuf);

    // Set the packet length.
    if (willCompress) producer.prepend(await VarInt.serialise(producer.byteLength));

    return producer.compile();
  } catch (err) {
    // We wouldn't want to terminate the connection now would we?
    log.error("An error occurred while serialising a packet!\n", err);
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

  // Get the packet from the incoming packets list.
  const packet = packets.I[state][id] as P;

  if (!packet) return;

  // Set the hidden properties of packet and data length.
  Packet.setPacketLength(packet, packetLength);
  Packet.setDataLength(packet, dataLength);

  for (const [key, field] of Packet.getFields(packet).entries()) {
    packet[key as keyof P] = await field.deserialise(consumer);
  }

  return packet;
}
