import { FieldCodec } from "../field_codec.ts";

export const varLong: FieldCodec<bigint> = {
  encode(value) {
    const byteArr = [];

    while (value !== 0n) {
      let temp = value & 0x7fn;

      value >>= 7n;
      if (value !== 0n) temp |= 0x80n;

      byteArr.push(Number(temp));
    }

    return Uint8Array.from(byteArr);
  },

  decode(consume) {
    let numRead = 0n;
    let result = 0n;

    while (true) {
      const [read] = consume("read", 1);
      result |= (BigInt(read) & 0x7fn) << (7n * numRead);

      numRead++;
      if (numRead > 10) {
        throw new TypeError("A varLong can not have more than 9 bytes");
      }

      if ((read & 0x80) !== 0x80) break;
    }

    return result;
  },
};
