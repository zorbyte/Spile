import TypeCodec from "../TypeCodec";

interface Long extends TypeCodec<bigint> {
  max: bigint;
  min: bigint;
}

const Long: Long = {
  max: BigInt("9223372036854775807"),
  min: BigInt("-9223372036854775808"),
  async serialise(value) {
    if (value % BigInt(1) === BigInt(0)) throw new Error("Long must be a whole number.");
    if (value > Long.max || value < Long.min) {
      throw new Error("A Long may only be an integer between -9223372036854775808 and 9223372036854775807!");
    }
    const buff = Buffer.alloc(8);
    buff.writeBigInt64BE(value);
    return buff;
  },

  async deserialise(consumer) {
    const bytes = consumer.consume(8);
    return bytes.readBigInt64BE();
  },
};

export default Int;
