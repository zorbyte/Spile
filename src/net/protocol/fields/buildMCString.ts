import { TextDecoder, TextEncoder } from "util";

import { STypeError } from "@lib/errors";

import Field from "../Field";

import VarInt from "./VarInt";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const buildMCString = (n = 32767): Field<string> => ({
  async serialise(str) {
    const encLenOfStr = await VarInt.serialise(Buffer.byteLength(str));
    const encStr = encoder.encode(str);
    const totalLength = encLenOfStr.length + encStr.length;

    if (maxLen(totalLength) > n) throw new STypeError("INVALID_FIELD", "An MCString must comply with: (n * 4) + 3 > byteLen(outbound.n)");
    const into = Buffer.concat([encLenOfStr, encStr], totalLength);

    return into;
  },

  async deserialise(consumer) {
    const len = await VarInt.deserialise(consumer);
    const data = consumer.consume(len);
    const str = decoder.decode(data);

    // Do I really have to say this again?
    n = n ?? str.length;
    if (data.byteLength > maxLen(n)) {
      throw new STypeError("INVALID_FIELD", "An MCString must comply with: (n * 4) + 3 > byteLen(incoming.n)");
    }

    return str;
  },
});

// Yes, the beloved max string length formula, also specified on wiki.vg!
function maxLen(n = 32767) {
  return (n * 4) + 3;
}

export default buildMCString;
