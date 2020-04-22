import { deflate } from "@utils/utils";

import ByteConsumer from "../ByteConsumer";

import MCString from "./types/MCString";
import VarInt from "./types/VarInt";
import TypeCodec from "./TypeCodec";

type TCodecGen<T> = T extends TypeCodec<infer TCodecGen> ? TCodecGen : never;
type TypeCodecGenerics<T> = { [P in keyof T]: TCodecGen<T[P]> };

class PacketCodec<T extends TypeCodec<any>[]> {
  public constructor(public id: number, private codecs: T) {}

  /**
   * serialise
   *
   * @param compressionThreshold The threshold for compression.
   * @param args The arguments to serialise... ORDER IS IMPORTANT
   */
  public async serialise(compressionThreshold: number, ...args: TypeCodecGenerics<T>): Promise<Buffer> {
    args = [this.id, ...args] as TypeCodecGenerics<T>;

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
      const comp = await deflate(Buffer.concat(accumulated));
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
    _length: boolean,
    consumer: ByteConsumer,
  ): AsyncGenerator<TypeCodecGenerics<T>, void, void> {
    for (const codec of this.codecs) {
      yield await codec.deserialise(consumer);
    }
  }
}

new PacketCodec(0x0, [VarInt, MCString]).serialise(3);

export default PacketCodec;
