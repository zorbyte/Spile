import { STypeError } from "@lib/errors";

import Field from "../Field";

interface Long extends Field<bigint> {
  max: bigint;
  min: bigint;
}

const Long: Long = {
  max: 9223372036854775807n,
  min: -9223372036854775808n,
  serialise(value) {
    if (value % 1n === 0n) throw new STypeError("INVALID_FIELD", "Long must be a whole number.");
    if (value > Long.max || value < Long.min) {
      throw new STypeError("INVALID_FIELD", "A Long may only be an integer between -9223372036854775808 and 9223372036854775807!");
    }

    const buff = Buffer.alloc(8);
    buff.writeBigInt64BE(value);

    return buff;
  },

  deserialise(consumer) {
    const bytes = consumer.consume(8);

    return bytes.readBigInt64BE();
  },
};

export default Long;
