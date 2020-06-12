import { getBytesOfNumber } from "../io_utils.ts";
import { FieldCodecBuilder } from "../field_codec.ts";

export const short = new FieldCodecBuilder<number>("short")
  .validate((value) => value >= -32768 && value <= 32767)
  .encode((value) => getBytesOfNumber(2, value, "setInt16"))
  .decode(async (consumer) => {
    const [offset, view] = await consumer.readWithView(2);
    return view.getInt16(offset);
  })
  .compile();
