import { STypeError } from "@utils/errors/mod.ts";

import { FieldCodecBuilder } from "../field_codec.ts";

const MAX = 2147483647;
const MIN = -2147483648;

export const varInt = new FieldCodecBuilder<number>("varInt")
  .validate((value) => value < MAX && value > MIN)
  .encode((value) => {
    const byteArr = [];

    while (true) {
      let temp = value & 0x7F;
      value >>>= 7;

      if (value !== 0) temp |= 0x80;
      byteArr.push(temp);

      if (value === 0) break;
    }

    return Uint8Array.from(byteArr);
  })
  .decode(async (consumer) => {
    let numRead = 0;
    let result = 0;

    while (true) {
      const [read] = await consumer.read(1);
      result |= (read & 0x7F) << (7 * numRead);
      numRead++;

      if (numRead > 5) {
        throw new STypeError("INVALID_FIELD_DATA", "varInt", "decoding", "N/A");
      }

      if ((read & 0x80) !== 0x80) break;
    }

    return result;
  })
  .compile();
