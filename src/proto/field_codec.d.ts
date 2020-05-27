import { Asyncable } from "../utils/type_utils.d.ts";

import { Consumer } from "./io_utils.ts";

export interface FieldCodec<T extends unknown> {
  encode: (data: T) => Asyncable<Uint8Array>;
  decode: (consumer: Consumer) => Asyncable<T>;
}
