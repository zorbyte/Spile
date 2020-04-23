import TypeCodec from "../TypeCodec";

const Float: TypeCodec<number> = {
  async serialise(value) {
    const buff = Buffer.alloc(4);
    buff.writeFloatBE(value);
    return buff;
  },

  async deserialise(consumer) {
    const bytes = consumer.consume(4);
    return bytes.readFloatBE();
  },
};

export default Float;
