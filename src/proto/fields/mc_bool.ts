import { STypeError } from "../../errors/mod.ts";

import { FieldCodec } from "../field_codec.d.ts";

export const MCBool: FieldCodec<boolean> = {
  encode(value) {
    return Uint8Array.of(value ? 0x01 : 0x00);
  },

  decode(consume) {
    const [byte] = consume("read", 1);

    if (byte === 0x01) return true;
    if (byte === 0x00) return false;

    throw new STypeError("INVALID_FIELD", "MCBoolean was not 0x01 or 0x00");
  },
};
