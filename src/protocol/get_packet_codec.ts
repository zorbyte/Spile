import { State } from "./client.ts";
import { PacketCodec } from "./packet_codec.ts";
import { ProtocolHeaders } from "./io_utils.ts";

import { handshake } from "./packets/handshake/handshake.ts";

const packetCodecs = {
  [State.HANDSHAKE]: {
    0x00: handshake,
  },
} as unknown as Record<
  State,
  Record<number, PacketCodec<ProtocolHeaders & unknown>>
>;

export function getPacketCodec(id: number, state: State) {
  return packetCodecs?.[state]?.[id];
}
