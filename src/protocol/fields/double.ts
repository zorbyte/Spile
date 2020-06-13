import { getBytesOfNumber } from "../io_utils.ts";
import { FieldCodecBuilder } from "../field_codec.ts";

export const double = new FieldCodecBuilder<number>("double")
  .validate(
    (value) =>
      value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER,
  )
  .encode((value) => getBytesOfNumber(8, value, "setFloat64"))
  .decode(async (consumer) => {
    const view = await consumer.readWithView(8);
    return view.getFloat64(0);
  })
  .compile();
