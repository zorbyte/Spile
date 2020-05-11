import { Asyncable } from "@utils/typeUtils";

import BufferConsumer from "./BufferConsumer";

export default interface Field<T extends unknown> {
  serialise: (data: T) => Asyncable<Buffer>;
  deserialise: (consumer: BufferConsumer) => Asyncable<T>;
}
