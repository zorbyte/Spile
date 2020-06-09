import { flatStr } from "@utils/common.ts";

import { concatArrays } from "../io_utils.ts";
import { FieldCodec } from "../field_codec.ts";

import { varInt } from "./var_int.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const buildMCString = (n = 32767): FieldCodec<string> => ({
  async encode(str) {
    str = flatStr(str);
    if (str.length > n) {
      throw new TypeError(`This MCString can have up tp ${n} characters`);
    }

    const encStr = encoder.encode(str);
    const encLenOfStr = await varInt.encode(encStr.length);
    const totalLength = encLenOfStr.length + encStr.length;

    if (totalLength > n * 4 + 3) {
      throw new TypeError(
        "An MCString used more than (n * 4) + 3 bytes to encode n characters",
      );
    }

    const into = concatArrays([encLenOfStr, encStr], totalLength);

    return into;
  },

  async decode(consumer) {
    const len = await varInt.decode(consumer);
    if (len > n * 4) {
      throw new TypeError(`This MCString has a maximum of ${n * 4} bytes`);
    }

    const data = await consumer.read(len);
    const str = decoder.decode(data);

    return flatStr(str);
  },
});
