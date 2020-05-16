import Field from "../Field";

const Float: Field<number> = {
  encode(value) {
    const buff = Buffer.alloc(4);
    buff.writeFloatBE(value);

    return buff;
  },

  decode(consumer) {
    const bytes = consumer.consume(4);

    return bytes.readFloatBE();
  },
};

export default Float;
