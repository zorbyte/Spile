import { STypeError } from "../../errors/mod.ts";
import { FieldCodec } from "../field_codec.d.ts";

export const varLong: FieldCodec<bigint> = {
  encode(value) {
    const byteArr = [];

    while (value !== 0n) {
      let temp = value & 0x7fn;

      value >>= 7n;
      if (value !== 0n) temp |= 0x80n;

      byteArr.push(temp);
    }

    return Uint8Array.from((byteArr as unknown) as number[]);
  },

  decode(consume) {
    let numRead = 0n;
    let result = 0n;

    while (true) {
      const [read] = consume(1);
      result |= (BigInt(read) & 0x7fn) << (7n * numRead);

      numRead++;
      if (numRead > 10) {
        throw new STypeError(
          "INVALID_FIELD",
          "A VarLong can not have more than 10 bytes",
        );
      }

      if ((read & 0x80) !== 0x80) break;
    }

    return result;
  },
};
