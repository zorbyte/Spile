import {
  MAX_PLAYERS,
  MINECRAFT_VERSION,
  MOTD,
  PLAYER_COUNT,
  PROTOCOL_VERSION,
} from "@lib/constants";
import Packet from "@net/protocol/Packet";

import ResponsePacket from "./Response";

const RequestPacket = new Packet(0x00, "request", "I")
  .onBuilt(() => {
    const res = ResponsePacket;
    res.body = {
      version: {
        name: MINECRAFT_VERSION,
        protocol: PROTOCOL_VERSION,
      },
      description: {
        text: MOTD,
      },
      players: {
        max: MAX_PLAYERS,
        online: PLAYER_COUNT,
        sample: [],
      },
    };

    return res;
  })
  .compile();

export default RequestPacket;
