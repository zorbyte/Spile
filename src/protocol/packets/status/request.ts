import { MINECRAFT_VERSION, PROTOCOL_VERSION } from "@etc/package.ts";

import { PacketCodecBuilder } from "../../packet_codec.ts";

import { response } from "./response.ts";

const STUB_MOTD = "A Spile server.";
const STUB_MAX_PLAYERS = 20;
const STUB_PLAYER_COUNT = 0;

export const request = new PacketCodecBuilder(0x00, "request")
  .compile(() => {
    const res = response.getScaffold();

    res.body = {
      version: {
        name: MINECRAFT_VERSION,
        protocol: PROTOCOL_VERSION,
      },
      description: {
        text: STUB_MOTD,
      },
      players: {
        max: STUB_MAX_PLAYERS,
        online: STUB_PLAYER_COUNT,
        sample: [],
      },
    };

    return res;
  });
