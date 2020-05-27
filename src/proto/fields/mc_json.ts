import { parse } from "../../deps.ts";

import { FieldCodec } from "../field_codec.d.ts";
import { buildMCString } from "./mc_string.ts";

export function buildMCJson<T>(): FieldCodec<T> {
  const strCodec = buildMCString();

  return {
    async encode(data): Promise<Uint8Array> {
      const jsonBuff = await strCodec.encode(JSON.stringify(data));

      return jsonBuff;
    },

    async decode(consume): Promise<T> {
      const rawJson = await strCodec.decode(consume);

      return parse(rawJson);
    },
  };
}
