import TypeCodec from "../TypeCodec";

const Double: TypeCodec<number> = {
  async serialise(value) {
    const buff = Buffer.alloc(8);
    buff.writeDoubleBE(value);
    return buff;
  },

  async deserialise(consumer) {
    const bytes = consumer.consume(8);
    return bytes.readDoubleBE();
  },
};

export default Double;
