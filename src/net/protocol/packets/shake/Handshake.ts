import Field from "@net/protocol/Field";
import buildMCString from "@net/protocol/fields/buildMCString";
import UShort from "@net/protocol/fields/UShort";
import VarInt from "@net/protocol/fields/VarInt";
import Packet from "@net/protocol/Packet";
import State from "@net/protocol/State";

import ow from "ow";

const HandshakePacket = new Packet(0x00, "handshake", "I")
  .addField("version", VarInt)
  .addField("address", buildMCString())
  .addField("port", UShort)
  .addField(
    "nextState",
    VarInt as Field<State.STATS | State.LOGIN>,
    ow.number.inRange(State.STATS, State.LOGIN),
    State.STATS,
  )
  .skipField("nextState", packet => packet.version < 1_15_2)
  .onRun((packet, client) => {
    // TODO: Remove me, this is just testing.
    client.log.debug(packet);
    client.state = packet.nextState;
  })
  .build();

export default HandshakePacket;
