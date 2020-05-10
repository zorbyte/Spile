import MCBoolean from "@net/protocol/fields/MCBoolean";
import VarInt from "@net/protocol/fields/VarInt";
import Packet from "@net/protocol/Packet";

const testPacket = new Packet(0x0, "test", "I")
  .addField("playerCount", VarInt)
  .addField("playerOnline", MCBoolean)
  .onRun((_client, packet) => {
    packet.playerCount;
    packet.playerOnline;
  })
  .build();

export default testPacket;
