import { FieldCodec } from "../field_codec.d.ts";

export const double: FieldCodec<number> = {
  encode(value) {
    const bytes = new Uint8Array(8);
    const view = new DataView(bytes);
    view.setFloat64(0, value);

    return bytes;
  },

  decode(consume) {
    const bytes = consume(8);
    const view = new DataView(bytes);

    return view.getFloat64(0);
  },
};
