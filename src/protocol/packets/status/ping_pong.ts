import { PacketCodecBuilder } from "../../packet_codec.ts";

import { long } from "../../fields/long.ts";

// NOTE: This is not used for handling the ping packet as the below code may suggest.
// Since Spile works as both a framework and a server, we should keep this functionality
// but this is handled in the server for performance purposes.
export const pingPong = new PacketCodecBuilder(0x01, "ping_pong")
  .addField("randomData", long)
  .compile((ctx) => {
    const pong = pingPong.getScaffold();
    pong.randomData = ctx.packet.randomData;
    ctx.close();

    return pong;
  });
