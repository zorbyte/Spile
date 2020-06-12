import { getBytesOfNumber } from "../io_utils.ts";
import { FieldCodecBuilder } from "../field_codec.ts";

export const byte = new FieldCodecBuilder<number>("byte")
  .validate((value) => value >= -128 && value <= 127)
  .encode((value) => getBytesOfNumber(1, value, "setInt8"))
  .decode(async (consumer) => {
    const [offset, view] = await consumer.readWithView(1);
    return view.getInt8(offset);
  })
  .compile();
