import { STypeError } from "@lib/errors";

import Field from "../Field";

const UByte: Field<number> = {
  encode(value) {
    if (value < 0 || value > 255) throw new STypeError("INVALID_FIELD", "A UByte may only be an integer between 0 and 255");

    const buff = Buffer.alloc(1);
    buff.writeUInt8(value);

    return buff;
  },

  decode(consumer) {
    const bytes = consumer.consume(1);

    return bytes.readUInt8();
  },
};

export default UByte;
