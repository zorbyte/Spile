import { Asyncable } from "@utils/typeUtils";

import BufferConsumer from "./BufferConsumer";

export default interface Field<T extends unknown> {
  encode: (data: T) => Asyncable<Buffer>;
  decode: (consumer: BufferConsumer) => Asyncable<T>;
}
