import { $TSFix } from "@utils/typeUtils";

import Handshake from "./packets/inbound/Handshake";
import { State } from "./Client";
import Packet from "./Packet";

type MapMember<T extends typeof Packet> = {
  [key in State]?: {
    [id: number]: T;
  }
};

export interface PacketMap {
  inbound: MapMember<Handshake | $TSFix>;
  outbound: MapMember<Handshake | $TSFix>;
}

const packetMap: PacketMap = {
  inbound: {
    [State.SHAKE]: {
      [Handshake.id]: Handshake,
    },
  },
  outbound: {
    [State.SHAKE]: {
      [Handshake.id]: Handshake,
    },
  },
};

export default packetMap;
