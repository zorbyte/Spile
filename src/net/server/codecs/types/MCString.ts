import { TextDecoder, TextEncoder } from "util";

import TypeCodec from "../TypeCodec";

import VarInt from "./VarInt";

interface MCString extends TypeCodec<string> {
  decoder: TextDecoder;
  encoder: TextEncoder;
}

const MCString: MCString = {
  decoder: new TextDecoder(),
  encoder: new TextEncoder(),

  async serialise(str) {
    const lenOfStr = await VarInt.serialise(Buffer.byteLength(str));
    const encStr = MCString.encoder.encode(str);
    const into = Buffer.concat([lenOfStr, encStr], lenOfStr.length + encStr.length);
    
    return into;
  },

  async deserialise(consumer) {
    const len = await VarInt.deserialise(consumer);
    const data = consumer.consume(len);
    const str = MCString.decoder.decode(data);
    return str;
  },
};

export default MCString;
