import { STypeError } from "@lib/errors";

import Field from "../Field";

// TODO: Investigate whether or not the documented values of 0x01 and 0x00 on wiki.vg have any effects on endianness.
// Almost certain they don't, but if it does, would try parsing with as a Uint8BE with the buffer interface.
const MCBoolean: Field<boolean> = {
  serialise(value) {
    const buff = Buffer.alloc(1, value ? 0x01 : 0x00);

    return buff;
  },

  deserialise(consumer) {
    const [byte] = consumer.consume(1);

    if (byte === 0x01) return true;
    if (byte === 0x00) return false;

    throw new STypeError("INVALID_FIELD", "MCBoolean was not 0x01 or 0x00!");
  },
};

export default MCBoolean;
