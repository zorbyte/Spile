import { TextDecoder, TextEncoder } from "util";

import TypeCodec from "../TypeCodec";

import VarInt from "./VarInt";

interface MCString extends TypeCodec<string> {
  decoder: TextDecoder;
  encoder: TextEncoder;
  maxLen: (n?: number) => number;
}

const MCString: MCString = {
  decoder: new TextDecoder(),
  encoder: new TextEncoder(),
  maxLen: (n = 32767) => (n * 4) + 3,

  async serialise(str, n) {
    const encLenOfStr = await VarInt.serialise(Buffer.byteLength(str));
    const encStr = MCString.encoder.encode(str);
    n = n ?? str.length;
    if (n * 4 > encStr.byteLength) throw new Error("Invalid MCString! n * 4 > bytes(n)");
    const into = Buffer.concat([encLenOfStr, encStr], encLenOfStr.length + encStr.length);
    
    return into;
  },

  async deserialise(consumer, n) {
    const len = await VarInt.deserialise(consumer);
    const data = consumer.consume(len);
    const str = MCString.decoder.decode(data);
    n = n ?? str.length;
    if (n * 4 > data.byteLength) throw new Error("Invalid MCString! n * 4 > bytes(n)");
    return str;
  },
};

export default MCString as TypeCodec<string>;
