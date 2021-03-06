import { getBytesOfNumber } from "../io_utils.ts";
import { FieldCodecBuilder } from "../field_codec.ts";

export const int = new FieldCodecBuilder<number>("int")
  .validate((value) => value >= -2147483648 && value <= 2147483647)
  .encode((value) => getBytesOfNumber(4, value, "setInt32"))
  .decode(async (consumer) => {
    const view = await consumer.readWithView(4);
    return view.getInt32(0);
  })
  .compile();
