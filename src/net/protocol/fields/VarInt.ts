import { STypeError } from "@lib/errors";

import Field from "../Field";

const VarInt: Field<number> = {
  serialise(value) {
    const byteArr = [];

    while (true) {
      let temp = value & 0x7F;
      value >>>= 7;

      if (value !== 0) temp |= 0x80;
      byteArr.push(temp);

      if (value === 0) break;
    }

    return Buffer.from(byteArr);
  },

  deserialise(consumer) {
    let numRead = 0;
    let result = 0;

    while (true) {
      const [read] = consumer.consume(1);
      result |= (read & 0x7F) << Math.abs(7 * numRead);

      numRead++;
      if (numRead > 5) throw new STypeError("INVALID_FIELD", "A VarInt can not have more than 5 bytes!");

      if ((read & 0x80) !== 0x80) break;
    }

    return result;
  },
};

export default VarInt;
