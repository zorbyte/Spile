import { getBytesOfNumber } from "../io_utils.ts";
import { FieldCodecBuilder } from "../field_codec.ts";

export const byte = new FieldCodecBuilder<number>("byte")
  .validate((value) => value < 127 && value > -128)
  .encode((value) => getBytesOfNumber(2, value, "setInt16"))
  .decode(async (consumer) => {
    const [offset, view] = await consumer.readWithView(2);
    return view.getInt16(offset);
  })
  .compile();
