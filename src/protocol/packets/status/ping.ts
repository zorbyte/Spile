import { PacketCodecBuilder } from "../../packet_codec.ts";

import { long } from "../../fields/long.ts";

export const ping = new PacketCodecBuilder(0x01, "ping")
  .addField("randomData", long)
  .compile();
