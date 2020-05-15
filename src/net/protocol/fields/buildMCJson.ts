import { mainLog } from "@lib/mainLog";

import fjs from "fast-json-stringify";
import secJsonParse from "secure-json-parse";

import Field from "../Field";

import buildMCString from "./buildMCString";
import VarInt from "./VarInt";

function buildMCJson<T>(schema?: fjs.Schema): Field<T> {
  const stringify = schema ? fjs(schema) as unknown as (doc: T) => string : JSON.stringify;
  if (!schema) {
    const log = mainLog.child("packetCodec-JSON");
    log.warn("Build JSON was called without a schema! It is highly advised that you make one");
    log.debug("Tip: Throw an error in buildMCJson to figure out which packet is the culprit when debugging this");
  }

  return {
    async serialise(data): Promise<Buffer> {
      const jAsStr = stringify(data);
      const len = jAsStr.length;
      const lenBuff = await VarInt.serialise(len);
      const MCString = buildMCString(len);
      const jsonBuff = await MCString.serialise(jAsStr);

      return Buffer.concat([lenBuff, jsonBuff], lenBuff.length + jsonBuff.length);
    },

    async deserialise(consumer): Promise<T> {
      const len = await VarInt.deserialise(consumer);
      const MCString = buildMCString(len);
      const rawJson = await MCString.deserialise(consumer);

      return secJsonParse.parse(rawJson);
    },
  };
}

export default buildMCJson;
