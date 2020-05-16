import { STypeError } from "@lib/errors";

import Field from "../Field";

const Byte: Field<number> = {
  encode(value) {
    if (value > 127 || value < -128) throw new STypeError("INVALID_FIELD", "A Byte may only be an integer between -128 and 127");
    const buff = Buffer.alloc(2);
    buff.writeInt16BE(value);

    return buff;
  },

  decode(consumer) {
    const bytes = consumer.consume(2);
    return bytes.readInt16BE();
  },
};

export default Byte;
