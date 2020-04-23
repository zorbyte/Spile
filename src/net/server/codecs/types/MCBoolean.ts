import TypeCodec from "../TypeCodec";

const MCBoolean: TypeCodec<boolean> = {
  async serialise(value) {
    const buff = Buffer.alloc(1, value ? 0x01 : 0x00);
    return buff;
  },

  async deserialise(consumer) {
    const [byte] = consumer.consume(1);
    return byte === 0x01;
  },
};

export default MCBoolean;
