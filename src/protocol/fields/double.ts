import { FieldCodecBuilder } from "../field_codec.ts";
import { getBytesOfNumber } from "../io_utils.ts";

export const double = new FieldCodecBuilder<number>("double")
  .validate((value) =>
    value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER
  )
  .encode((value) => getBytesOfNumber(8, value, "setFloat64"))
  .decode(async (consumer) => {
    const [offset, view] = await consumer.readWithView(8);
    return view.getFloat64(offset);
  })
  .compile();
