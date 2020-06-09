import { STypeError } from "../../errors/mod.ts";

import { FieldCodec } from "../field_codec.ts";

export const MCBool: FieldCodec<boolean> = {
  encode(value) {
    return Uint8Array.of(value ? 0x01 : 0x00);
  },

  decode(consume) {
    const [byte] = consume("read", 1);

    if (byte === 0x01) return true;
    if (byte === 0x00) return false;

    throw new STypeError("FIELD_DATA_INVALID", "MCBool", "decoding", byte);
  },
};
