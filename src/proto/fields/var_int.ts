import { STypeError } from "../../errors/mod.ts";
import { FieldCodec } from "../field_codec.d.ts";

export const varInt: FieldCodec<number> = {
  encode(value) {
    const byteArr = [];

    while (true) {
      let temp = value & 0x7F;
      value >>>= 7;

      if (value !== 0) temp |= 0x80;
      byteArr.push(temp);

      if (value === 0) break;
    }

    return Uint8Array.from(byteArr);
  },

  decode(consume) {
    let numRead = 0;
    let result = 0;

    while (true) {
      const [read] = consume(1);
      result |= (read & 0x7F) << (7 * numRead);

      numRead++;
      if (numRead > 5) {
        throw new STypeError(
          "INVALID_FIELD",
          "A VarInt can not have more than 5 bytes",
        );
      }

      if ((read & 0x80) !== 0x80) break;
    }

    return result;
  },
};
