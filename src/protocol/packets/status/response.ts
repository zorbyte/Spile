import { PacketCodecBuilder } from "../../packet_codec.ts";

import { pingPong } from "./ping_pong.ts";

import { buildMCJson } from "../../fields/mc_json.ts";

interface PlayerSample {
  name: string;
  id: string;
}

export interface ResponseBody {
  version: {
    name: string;
    protocol: number;
  };
  players: {
    max?: number;
    online?: number;
    sample: PlayerSample[];
  };
  description: {
    text?: string;
  };
  favicon?: string;
}

export const response = new PacketCodecBuilder(0x00, "response")
  .addField("body", buildMCJson<ResponseBody>())
  .compile(() => {
    const ping = pingPong.getScaffold();
    ping.randomData = BigInt(Date.now());

    return ping;
  });
