import PacketCodec from "@net/server/codecs/PacketCodec";
import TypeCodec from "@net/server/codecs/TypeCodec";
import MCJSON from "@net/server/codecs/types/MCJSON";
import Packet from "@net/server/packets/Packet";
import ResponseSchema, { ResponseData } from "@net/server/schemas/Response";

class Response extends Packet<Response> {
  public static id = 0x0;
  private static codec = new PacketCodec(
    Response.id,
    new MCJSON<ResponseData>(ResponseSchema) as TypeCodec<ResponseData>,
  );

  public data: ResponseData;

  public constructor() {
    super(Response.id);
  }

  public serialise(compressionThreshold: number): Promise<Buffer> {
    return Response.codec.serialise(compressionThreshold, [], this.data);
  }
}

export default Response;
