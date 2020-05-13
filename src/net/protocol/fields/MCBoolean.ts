import { STypeError } from "@lib/errors";

import Field from "../Field";

const MCBoolean: Field<boolean> = {
  serialise(value) {
    return Buffer.alloc(1, value ? 0x01 : 0x00);
  },

  deserialise(consumer) {
    const [byte] = consumer.consume(1);

    if (byte === 0x01) return true;
    if (byte === 0x00) return false;

    throw new STypeError("INVALID_FIELD", "MCBoolean was not 0x01 or 0x00!");
  },
};

export default MCBoolean;
