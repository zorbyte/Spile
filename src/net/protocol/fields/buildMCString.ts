import { STypeError } from "@lib/errors";

import flatstr from "flatstr";
import iconv from "iconv-lite";

import Field from "../Field";

import VarInt from "./VarInt";

const buildMCString = (n = 32767): Field<string> => ({
  async encode(str) {
    str = flatstr(str);
    if (str.length > n) throw new STypeError("INVALID_FIELD", `This MCString can have up tp ${n} characters`);
    const encStr = iconv.encode(str, "utf8");
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
    const str = iconv.decode(data, "utf8");

    return str;
  },
});

export default buildMCString;
