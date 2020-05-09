import Field from "../Field";

const MCBoolean: Field<boolean> = {
  serialise(value) {
    const buff = Buffer.alloc(1, value ? 0x01 : 0x00);

    return buff;
  },

  deserialise(consumer) {
    const [byte] = consumer.consume(1);

    return byte === 0x01;
  },
};

export default MCBoolean;
