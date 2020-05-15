import Long from "@net/protocol/fields/Long";
import Packet from "@net/protocol/Packet";

const PongPacket = new Packet(0x01, "pong", "O")
  .addField("dataClone", Long)
  .compile();

export default PongPacket;
