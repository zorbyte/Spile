import PacketCodec from "@codecs/PacketCodec";
import MCString from "@codecs/types/MCString";
import UShort from "@codecs/types/UShort";
import VarInt from "@codecs/types/VarInt";
import ByteConsumer from "@net/server/ByteConsumer";
import { State } from "@net/server/Client";
import Packet from "@net/server/Packet";
import { $TSFix, PacketKeys } from "@utils/typeUtils";

class Handshake extends Packet<Handshake> {
  public static id = 0x0;
  private static codec = new PacketCodec(Handshake.id, VarInt, MCString, UShort, VarInt);

  public protocolVersion: number;
  public serverAddress: string;
  public serverPort: number;
  public nextState: State.STATS | State.LOGIN;


  public constructor() {
    super(Handshake.id);
  }

  public async deserialise(consumer: ByteConsumer): Promise<Handshake> {
    const keys: PacketKeys<Handshake> = [
      "protocolVersion",
      "serverAddress",
      "serverPort",
      "nextState",
    ];

    let i = 0;
    const gen = Handshake.codec.deserialise(consumer, [255]);
    for await (const field of gen) {
      // Trust me, this should work :P
      (this[keys[i]] as $TSFix) = field;
      i++;
    }

    return this;
  }
}

export default Handshake;
