import fjs from "fast-json-stringify";
import secJsonParse from "secure-json-parse";

import ByteConsumer from "../ByteConsumer";
import Field from "../Field";

import buildMCString from "./buildMCString";
import VarInt from "./VarInt";

function buildMCJson<T>(schema: fjs.Schema): Field<T> {
  const stringify = fjs(schema) as unknown as (doc: T) => string;

  return {
    async serialise(data: T): Promise<Buffer> {
      const jAsStr = stringify(data);
      const len = jAsStr.length;
      const lenBuff = await VarInt.serialise(len);
      const MCString = buildMCString(len);
      const jsonBuff = await MCString.serialise(jAsStr);

      return Buffer.concat([lenBuff, jsonBuff], lenBuff.length + jsonBuff.length);
    },

    async deserialise(consumer: ByteConsumer): Promise<T> {
      const len = await VarInt.deserialise(consumer);
      const MCString = buildMCString(len);
      const rawJson = await MCString.deserialise(consumer);

      return secJsonParse.parse(rawJson);
    },
  };
}

export default buildMCJson;
