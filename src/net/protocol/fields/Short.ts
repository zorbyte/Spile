import { STypeError } from "@lib/errors";

import Field from "../Field";

const Short: Field<number> = {
  encode(value) {
    // TODO: Start using ow validation across all files.
    if (value < -32768 || value > 32767) throw new STypeError("INVALID_FIELD", "A Short may only be an integer between -32768 and 32767");

    const buff = Buffer.alloc(2);
    buff.writeInt16BE(value);

    return buff;
  },

  decode(consumer) {
    const bytes = consumer.consume(2);

    return bytes.readInt16BE();
  },
};

export default Short;
