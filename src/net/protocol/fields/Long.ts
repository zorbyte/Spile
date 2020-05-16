import { STypeError } from "@lib/errors";

import Field from "../Field";

// Make this a constant.
const max = 9223372036854775807n;
const min = -9223372036854775808n;

const Long: Field<bigint> = {
  encode(value) {
    if (value % 1n !== 0n) throw new STypeError("INVALID_FIELD", "Long must be a whole number");
    if (value > max || value < min) {
      throw new STypeError("INVALID_FIELD", "A Long may only be an integer between -9223372036854775808 and 9223372036854775807");
    }

    const buff = Buffer.alloc(8);
    buff.writeBigInt64BE(value);

    return buff;
  },

  decode(consumer) {
    const bytes = consumer.consume(8);

    return bytes.readBigInt64BE();
  },
};

export default Long;
