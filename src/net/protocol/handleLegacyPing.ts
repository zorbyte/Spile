import { MINECRAFT_VERSION, PROTOCOL_VERSION } from "@lib/constants";

import iconv from "iconv-lite";

import UShort from "./fields/UShort";
import BufferProducer from "./BufferProducer";
import Client from "./Client";

const MOTD = "A Minecraft Server";
const PLAYER_COUNT = 0;
const MAX_PLAYERS = 20;

async function handleLegacyPing(client: Client) {
  const producer = new BufferProducer();
  producer.append(Buffer.from([0xFF]));
  const str = `§1\0${PROTOCOL_VERSION}\0${MINECRAFT_VERSION}\0${MOTD}\0${PLAYER_COUNT}\0${MAX_PLAYERS}`;
  client.log.debug(`Legacy ping packet content: ${str.replace(/\x00/g, ".")}`);
  producer.append(await UShort.serialise(str.length));
  const pingBuffer = iconv.encode(str, "utf16be");
  producer.append(pingBuffer);

  client.handlingLegacy = true;
  client.state = 1;

  return producer.complete();
}

export default handleLegacyPing;
