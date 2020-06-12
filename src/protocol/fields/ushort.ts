import { getBytesOfNumber } from "../io_utils.ts";
import { FieldCodecBuilder } from "../field_codec.ts";

export const ushort = new FieldCodecBuilder<number>("ushort")
  .validate((value) => value >= 0 && value <= 65535)
  .encode((value) => getBytesOfNumber(2, value, "setUint16"))
  .decode(async (consumer) => {
    const [offset, view] = await consumer.readWithView(2);
    return view.getUint16(offset);
  })
  .compile();
