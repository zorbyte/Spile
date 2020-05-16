import buildMCJson from "@net/protocol/fields/buildMCJson";
import Packet from "@net/protocol/Packet";
import ResponseSchema, { ResponseBody } from "@type/schemas/ResponseSchema";

const ResponsePacket = new Packet(0x00, "response", "O")
  .addField("body", buildMCJson<ResponseBody>(ResponseSchema))
  .compile();

export default ResponsePacket;
