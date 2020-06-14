import { State } from "./context.ts";
import { PacketCodec } from "./packet_codec.ts";
import { ProtocolHeaders } from "./io_utils.ts";

/* Imports are ordered based on the direction relative to the server. */

// Inbound.
import { handshake } from "./packets/handshake/handshake.ts";
import { request } from "./packets/status/request.ts";

// Outbound.
import { pingPong } from "./packets/status/ping_pong.ts";
import { response } from "./packets/status/response.ts";

type UnknownCodec = PacketCodec<ProtocolHeaders>;

type PacketDirection = "I" | "O";
type PacketHolder = Record<
  State,
  Record<number, UnknownCodec>
>;

interface GetCodecOpts {
  state: State;
  direction: PacketDirection;
}

interface PacketCodecs {
  I: PacketHolder;
  O: PacketHolder;
}

// TODO: Use an I/O property on the packet codec itself to build this object.
const packetCodecs = {
  I: {
    [State.HANDSHAKE]: {
      0x00: handshake,
    },
    [State.STATUS]: {
      0x00: request,
    },
  },
  O: {
    [State.STATUS]: {
      0x00: response,
      0x01: pingPong,
    },
  },
} as unknown as PacketCodecs;

export function getPacketCodec(id: number, opts: GetCodecOpts) {
  return packetCodecs[opts.direction]?.[opts.state]?.[id];
}
