import { STypeError } from "@utils/errors/mod.ts";

import { FieldCodecBuilder } from "../field_codec.ts";

const MAX = 9223372036854775807n;
const MIN = -9223372036854775808n;

export const varLong = new FieldCodecBuilder<bigint>("varLong")
  .validate((value) => value < MAX && value > MIN)
  .encode((value) => {
    const byteArr = [];

    while (value !== 0n) {
      let temp = value & 0x7Fn;

      value >>= 7n;
      if (value !== 0n) temp |= 0x80n;

      byteArr.push(Number(temp));
    }

    return Uint8Array.from(byteArr);
  })
  .decode(async (consumer) => {
    let numRead = 0n;
    let result = 0n;

    while (true) {
      const [read] = await consumer.read(1);
      result |= (BigInt(read) & 0x7Fn) << (7n * numRead);
      numRead++;

      if (numRead > 10) {
        throw new STypeError(
          "INVALID_FIELD_DATA",
          "varLong",
          "decoding",
          "N/A",
        );
      }

      if ((read & 0x80) !== 0x80) break;
    }

    return result;
  })
  .compile();
