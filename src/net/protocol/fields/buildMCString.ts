import { TextDecoder, TextEncoder } from "util";

import Field from "../Field";

import VarInt from "./VarInt";

interface MCString extends Field<string> {
  decoder: TextDecoder;
  encoder: TextEncoder;
  maxLen: (n?: number) => number;
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const buildMCString = (n = 32767): Field<string> => ({
  async serialise(str) {
    const encLenOfStr = await VarInt.serialise(Buffer.byteLength(str));
    const encStr = encoder.encode(str);
    const totalLength = encLenOfStr.length + encStr.length;

    n = n ?? str.length;
    if (maxLen(n) > totalLength) throw new Error("Invalid MCString! (n * 4) + 3 > byteLen(outbound.n)");
    const into = Buffer.concat([encLenOfStr, encStr], totalLength);

    return into;
  },

  async deserialise(consumer) {
    const len = await VarInt.deserialise(consumer);
    const data = consumer.consume(len);
    const str = decoder.decode(data);

    n = n ?? str.length;
    if (data.byteLength > maxLen(n)) throw new Error("Invalid MCString! (n * 4) + 3 > byteLen(incoming.n)");

    return str;
  },
});

function maxLen(n = 32767) {
  return (n * 4) + 3;
}

export default buildMCString;
