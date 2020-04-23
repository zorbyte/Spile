import TypeCodec from "../TypeCodec";

const Int: TypeCodec<number> = {
  async serialise(value) {
    if (value > 2147483647 || value < -2147483648) throw new Error("A Byte may only be an integer between -2147483648 and 2147483647!");
    const buff = Buffer.alloc(4);
    buff.writeInt32BE(value);
    return buff;
  },

  async deserialise(consumer) {
    const bytes = consumer.consume(4);
    return bytes.readInt32BE();
  },
};

export default Int;
