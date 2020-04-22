import Handshake from "./packets/inbound/Handshake";
import { State } from "./Client";
import Packet from "./Packet";

type MapMember = {
  [key in State]?: {
    [id: number]: new () => Packet<any>;
  }
};

export interface PacketMap {
  inbound: MapMember;
  outbound: MapMember;
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
