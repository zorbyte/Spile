import PacketCodec from "@codecs/PacketCodec";
import VarInt from "@codecs/types/VarInt";
import MCString from "@net/server/codecs/types/MCString";
import VarLong from "@net/server/codecs/types/VarLong";
import Packet from "@net/server/Packet";

class Handshake extends Packet<Handshake> {
  public static id = 0x0;
  private codec = new PacketCodec(Handshake.id, [VarInt, VarLong, MCString]);

  public constructor() {
    super(Handshake.id);
  }

  public serialise(): Promise<Buffer> {
    return this.codec.serialise(5);
  }

  public async deserialise(): Promise<Handshake> {
    return this;
  }
}

export default Handshake;
