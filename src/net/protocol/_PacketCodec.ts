import { protocolDeflate } from "@utils/compression";

import VarInt from "./fields/VarInt";
import ByteConsumer from "./ByteConsumer";
import Field from "./Field";

type FieldGen<T> = T extends Field<infer FType> ? FType : never;
type FieldGenerics<T> = { [P in keyof T]: FieldGen<T[P]> };

class PacketCodec<T extends Field<any>[]> {
  private codecs: T;

  public constructor(public id: number, ...codecs: T) {
    this.codecs = codecs;
  }

  public async serialise(
    compressionThreshold: number,
    ...args: FieldGenerics<T>
  ) {
    args = [this.id, ...args] as FieldGenerics<T>;

    let i = 0;
    let byteSize = 0;
    let uncompSize = 0;
    const accumulated: Buffer[] = [];
    for (const codec of [VarInt, ...this.codecs]) {
      const serData = await codec.serialise(args[i]);

      byteSize += serData.byteLength;
      uncompSize += serData.length;

      accumulated.push(serData);
      i++;
    }

    let bufferSize = 0;
    const toConcat: Buffer[] = [];

    const dataLength = await VarInt.serialise(byteSize);

    toConcat.push(dataLength);
    bufferSize += dataLength.length;

    if (compressionThreshold !== -1 && byteSize > compressionThreshold) {
      const comp = await protocolDeflate(Buffer.concat(accumulated));
      const totalLength = await VarInt.serialise(dataLength.byteLength + comp.byteLength);

      toConcat.unshift(totalLength);
      bufferSize += totalLength.length + comp.length;
    } else {
      bufferSize += uncompSize;
    }

    toConcat.push(...accumulated);

    return Buffer.concat(toConcat, bufferSize);
  }

  public async *deserialise(
    consumer: ByteConsumer,
  ): AsyncGenerator<any, void, void> {
    for (const codec of this.codecs) {
      yield await codec.deserialise(consumer);
    }
  }
}

export default PacketCodec;
