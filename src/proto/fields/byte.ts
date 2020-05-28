import { STypeError } from "../../errors/mod.ts";
import { FieldCodec } from "../field_codec.d.ts";

export const byte: FieldCodec<number> = {
  encode(value) {
    if (value > 127 || value < -128) {
      throw new STypeError(
        "INVALID_FIELD",
        "A Byte may only be an integer between -128 and 127",
      );
    }

    const bytes = new Uint8Array(2);
    const view = new DataView(bytes);
    view.setInt16(0, value);

    return bytes;
  },

  decode(consume) {
    const [offset, view] = consume("view", 2);
    return view.getInt16(offset);
  },
};
