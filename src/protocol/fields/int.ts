import { FieldCodecBuilder } from "../field_codec.ts";
import { getNumberBytes } from "../io_utils.ts";

export const int = new FieldCodecBuilder<number>("int")
  .validate((value) => value < 2147483647 && value > -2147483648)
  .encode((value) => getNumberBytes(4, value, "setInt32"))
  .decode((consume) => {
    const [offset, view] = consume("view", 4);
    return view.getInt32(offset);
  })
  .compile();
