import { STypeError } from "@lib/errors";

import Field from "../Field";

const UShort: Field<number> = {
  serialise(value) {
    if (value > 65535 || value < 0) throw new STypeError("INVALID_FIELD", "A UShort may only be an integer between 0 and 65535!");
    const buff = Buffer.alloc(2);

    buff.writeInt16BE(value);

    return buff;
  },

  deserialise(consumer) {
    const bytes = consumer.consume(2);

    return bytes.readInt16BE();
  },
};

export default UShort;
