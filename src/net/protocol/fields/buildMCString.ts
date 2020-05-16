import { TextDecoder, TextEncoder } from "util";

import { STypeError } from "@lib/errors";

import flatstr from "flatstr";

import Field from "../Field";

import VarInt from "./VarInt";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const buildMCString = (n = 32767): Field<string> => ({
  async encode(str) {
    str = flatstr(str);
    if (str.length > n) throw new STypeError("INVALID_FIELD", `This MCString can have up tp ${n} characters`);
    const encStr = encoder.encode(str);
    const encLenOfStr = await VarInt.encode(encStr.length);
    const totalLength = encLenOfStr.length + encStr.length;

    if (totalLength > n * 4 + 3) {
      throw new STypeError("INVALID_FIELD", "An MCString used more than (n * 4) + 3 bytes to encode n characters");
    }

    const into = Buffer.concat([encLenOfStr, encStr], totalLength);

    return into;
  },

  async decode(consumer) {
    const len = await VarInt.decode(consumer);
    if (len > n * 4) throw new STypeError("INVALID_FIELD", `This MCString has a maximum of ${n * 4} bytes`);
    const data = consumer.consume(len);
    const str = decoder.decode(data);

    return flatstr(str);
  },
});

export default buildMCString;
