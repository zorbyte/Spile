import Long from "@net/protocol/fields/Long";
import Packet from "@net/protocol/Packet";

import PongPacket from "./Pong";

const PingPacket = new Packet(0x01, "ping", "I")
  .addField("randomData", Long)
  .onBuilt((packet, client) => {
    const pongRes = PongPacket;
    pongRes.dataClone = packet.randomData;

    client.scheduledClose = true;

    return pongRes;
  })
  .compile();

export default PingPacket;
