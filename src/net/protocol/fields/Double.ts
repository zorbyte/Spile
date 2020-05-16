import Field from "../Field";

const Double: Field<number> = {
  encode(value) {
    const buff = Buffer.alloc(8);
    buff.writeDoubleBE(value);

    return buff;
  },

  decode(consumer) {
    const bytes = consumer.consume(8);

    return bytes.readDoubleBE();
  },
};

export default Double;
