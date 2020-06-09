import { parse } from "secure-json-parse-deno/mod.js";

import { FieldCodec } from "../field_codec.ts";
import { buildMCString } from "./mc_string.ts";

export function buildMCJson<T>(): FieldCodec<T> {
  const strCodec = buildMCString();

  return {
    async encode(data): Promise<Uint8Array> {
      const jsonBuff = await strCodec.encode(JSON.stringify(data));

      return jsonBuff;
    },

    async decode(consumer): Promise<T> {
      const rawJson = await strCodec.decode(consumer);
      return parse(rawJson);
    },
  };
}
