import { FieldCodecBuilder } from "../field_codec.ts";
import { getNumberBytes } from "../io_utils.ts";

export const double = new FieldCodecBuilder<number>("double")
  .validate((value) =>
    value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER
  )
  .encode((value) => getNumberBytes(8, value, "setFloat64"))
  .decode((consume) => {
    const [offset, view] = consume("view", 8);
    return view.getFloat64(offset);
  })
  .compile();
