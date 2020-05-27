import { STypeError } from "../../errors/mod.ts";
import { FieldCodec } from "../field_codec.d.ts";

// Make this a constant.
const max = 9223372036854775807n;
const min = -9223372036854775808n;

export const long: FieldCodec<bigint> = {
  encode(value) {
    if (value % 1n !== 0n) {
      throw new STypeError("INVALID_FIELD", "Long must be a whole number");
    }

    if (value > max || value < min) {
      throw new STypeError(
        "INVALID_FIELD",
        "A Long may only be an integer between -9223372036854775808 and 9223372036854775807",
      );
    }

    const bytes = new Uint8Array(8);
    const view = new DataView(bytes);
    view.setBigInt64(0, value);

    return bytes;
  },

  decode(consume) {
    const bytes = consume(8);
    const view = new DataView(bytes);

    return view.getBigInt64(0);
  },
};
