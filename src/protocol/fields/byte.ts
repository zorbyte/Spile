import { FieldCodecBuilder } from "../field_codec.ts";
import { getNumberBytes } from "../io_utils.ts";

export const byte = new FieldCodecBuilder<number>("byte")
  .validate((value) => value < 127 && value > -128)
  .encode((value) => getNumberBytes(2, value, "setInt16"))
  .decode((consume) => {
    const [offset, view] = consume("view", 2);
    return view.getInt16(offset);
  })
  .compile();
