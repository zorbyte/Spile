import buildMCJson from "@net/protocol/fields/buildMCJson";
import Packet from "@net/protocol/Packet";
import { ResponseBody } from "@type/schemas/ResponseSchema";

const ResponsePacket = new Packet(0x00, "response", "O")
  .addField("body", buildMCJson<ResponseBody>())
  .compile();

export default ResponsePacket;
