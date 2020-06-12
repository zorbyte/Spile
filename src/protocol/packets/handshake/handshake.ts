import PacketCodec from "../../packet_codec.ts";

import { varInt } from "../../fields/var_int.ts";
import { buildMCString } from "../../fields/mc_string.ts";
import { ushort } from "../../fields/ushort.ts";

export const handshake = new PacketCodec(0x00, "handshake", "I")
  .addField("version", varInt)
  .addField("address", buildMCString(255))
  .addField("port", ushort)
  .addField("nextState", varInt)
  
