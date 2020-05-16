import { mainLog } from "@lib/mainLog";

import fjs, { Schema } from "fast-json-stringify";
import { parse } from "secure-json-parse";

import Field from "../Field";

import buildMCString from "./buildMCString";

function buildMCJson<T>(schema?: Schema): Field<T> {
  const stringify = schema ? fjs(schema) as unknown as (doc: T) => string : JSON.stringify;
  const MCString = buildMCString();

  if (!schema) {
    const log = mainLog.child("packetCodec-JSON");
    log.warn("Build JSON was called without a schema! It is highly advised that you make one");
    log.debug("Tip: Throw an error in buildMCJson to figure out which packet is the culprit when debugging this");
  }

  return {
    async encode(data): Promise<Buffer> {
      const jAsStr = stringify(data);
      const jsonBuff = await MCString.encode(jAsStr);

      return jsonBuff;
    },

    async decode(consumer): Promise<T> {
      const rawJson = await MCString.decode(consumer);

      return parse(rawJson);
    },
  };
}

export default buildMCJson;
