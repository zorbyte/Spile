import Field from "@net/protocol/Field";
import buildMCString from "@net/protocol/fields/buildMCString";
import UShort from "@net/protocol/fields/UShort";
import VarInt from "@net/protocol/fields/VarInt";
import Packet from "@net/protocol/Packet";
import State from "@net/protocol/State";

import ow from "ow";

const HandshakePacket = new Packet(0x00, "handshake", "I")
  .addField("version", VarInt)
  .addField("address", buildMCString(255))
  .addField("port", UShort)
  .addField(
    "nextState",
    VarInt as Field<State.STATS | State.LOGIN>,
    State.STATS,
    ow.number.inRange(State.STATS, State.LOGIN),
  )
  .onBuilt((packet, client) => {
    client.state = packet.nextState;
  })
  .compile();

export default HandshakePacket;
