import { STypeError } from "../../errors/mod.ts";
import { flatStr } from "../../utils/utils.ts";
import { FieldCodec } from "../field_codec.d.ts";
import { concatArrays } from "../io_utils.ts";
import { varInt } from "./var_int.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const buildMCString = (n = 32767): FieldCodec<string> => ({
  async encode(str) {
    str = flatStr(str);
    if (str.length > n) {
      throw new STypeError(
        "INVALID_FIELD",
        `This MCString can have up tp ${n} characters`,
      );
    }

    const encStr = encoder.encode(str);
    const encLenOfStr = await varInt.encode(encStr.length);
    const totalLength = encLenOfStr.length + encStr.length;

    if (totalLength > n * 4 + 3) {
      throw new STypeError(
        "INVALID_FIELD",
        "An MCString used more than (n * 4) + 3 bytes to encode n characters",
      );
    }

    const into = concatArrays([encLenOfStr, encStr], totalLength);

    return into;
  },

  async decode(consume) {
    const len = await varInt.decode(consume);
    if (len > n * 4) {
      throw new STypeError(
        "INVALID_FIELD",
        `This MCString has a maximum of ${n * 4} bytes`,
      );
    }
    const data = consume(len);
    const str = decoder.decode(data);

    return flatStr(str);
  },
});
