import { STypeError } from "@lib/errors";

import Field from "../Field";

const UShort: Field<number> = {
  encode(value) {
    if (value < 0 || value > 65535) throw new STypeError("INVALID_FIELD", "A UShort may only be an integer between 0 and 65535");

    const buff = Buffer.alloc(2);
    buff.writeUInt16BE(value);

    return buff;
  },

  decode(consumer) {
    const bytes = consumer.consume(2);

    return bytes.readUInt16BE();
  },
};

export default UShort;
