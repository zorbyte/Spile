import { STypeError } from "@lib/errors";

import Field from "../Field";

const Int: Field<number> = {
  serialise(value) {
    if (value > 2147483647 || value < -2147483648) {
      throw new STypeError("INVALID_FIELD", "A Byte may only be an integer between -2147483648 and 2147483647!");
    }

    const buff = Buffer.alloc(4);

    buff.writeInt32BE(value);

    return buff;
  },

  deserialise(consumer) {
    const bytes = consumer.consume(4);

    return bytes.readInt32BE();
  },
};

export default Int;
