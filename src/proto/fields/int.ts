import { STypeError } from "../../errors/mod.ts";
import { FieldCodec } from "../field_codec.d.ts";

export const int: FieldCodec<number> = {
  encode(value) {
    if (value > 2147483647 || value < -2147483648) {
      throw new STypeError(
        "INVALID_FIELD",
        "A Byte may only be an integer between -2147483648 and 2147483647",
      );
    }

    const bytes = new Uint8Array(4);
    const view = new DataView(bytes);
    view.setInt32(0, value);

    return bytes;
  },

  decode(consume) {
    const bytes = consume(4);
    const view = new DataView(bytes);

    return view.getInt32(0);
  },
};
