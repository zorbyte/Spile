import Handshake from "./packets/shake/inbound/Handshake";
import Request from "./packets/status/inbound/Request";
import Response from "./packets/status/outbound/Response";
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
    [State.STATS]: {
      [Request.id]: Request,
    },
  },
  outbound: {
    [State.STATS]: {
      [Response.id]: Response,
    },
  },
};

export default packetMap;
