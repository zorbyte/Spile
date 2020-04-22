import TypeCodec from "../TypeCodec";

const VarInt: TypeCodec<number> = {
  async serialise(value) {
    const byteArr = [];
    while (value !== 0) {
      let temp = value & 0x7F;
      value >>>= 7;
      if (value !== 0) temp |= 0x80;

      byteArr.push(temp);
    }

    return Buffer.from(byteArr);
  },

  async deserialise(consumer) {
    let numRead = 0;
    let result = 0;
    for (let [read] = consumer.consume(1); (read & 0x80) !== 0; [read] = consumer.consume(1)) {
      const value = read & 0x7F;
      result |= value << (7 * numRead);

      numRead++;
      if (numRead > 5) throw new Error("Invalid VarInt supplied! A VarInt can not have more than 5 bytes!");
    }

    return result;
  },
};

export default VarInt;
