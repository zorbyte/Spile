import TypeCodec from "../TypeCodec";

const UByte: TypeCodec<number> = {
  async serialise(value) {
    if (value > 255 || value < 0) throw new Error("A UByte may only be an integer between 0 and 255!");
    const buff = Buffer.alloc(1);
    buff.writeUInt8(value);
    return buff;
  },

  async deserialise(consumer) {
    const bytes = consumer.consume(1);
    return bytes.readUInt8();
  },
};

export default UByte;
