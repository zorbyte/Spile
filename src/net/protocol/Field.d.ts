import { Asyncable } from "@utils/typeUtils";

import ByteConsumer from "./ByteConsumer";

export default interface Field<T extends unknown> {
  serialise: (data: T) => Asyncable<Buffer>;
  deserialise: (consumer: ByteConsumer) => Asyncable<T>;
}
