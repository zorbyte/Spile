import { $TSFix } from "@utils/typeUtils";
import { deflate } from "@utils/utils";

import MCJSON from "./types/MCJSON";
import VarInt from "./types/VarInt";
import ByteConsumer from "./ByteConsumer";
import TypeCodec from "./TypeCodec";

type TCodecGen<T> = T extends TypeCodec<infer TCodecGen> ? TCodecGen : never;
type TypeCodecGenerics<T> = { [P in keyof T]: TCodecGen<T[P]> };

class PacketCodec<T extends TypeCodec<any>[]> {
  private codecs: T;

  public constructor(public id: number, ...codecs: T) {
    this.codecs = codecs;
  }

  /**
   * serialise
   *
   * @param compressionThreshold The threshold for compression.
   * @param args The arguments to serialise... ORDER IS IMPORTANT
   */
  public async serialise(
    compressionThreshold: number,
    stringLens: number[],
    ...args: TypeCodecGenerics<T>
  ): Promise<Buffer> {
    args = [this.id, ...args] as TypeCodecGenerics<T>;

    let i = 0;
    let strsProcessed = 0;
    let byteSize = 0;
    let uncompSize = 0;
    const accumulated: Buffer[] = [];
    for (const codec of [VarInt, ...this.codecs]) {
      const isStr = codec.serialise.length > 1 && !(codec instanceof MCJSON);
      const serData = await codec.serialise(args[i], isStr ? stringLens[strsProcessed] as $TSFix : void 0);
      byteSize += serData.byteLength;
      uncompSize += serData.length;

      accumulated.push(serData);
      if (isStr) strsProcessed++;
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
    consumer: ByteConsumer,
    stringLens: number[],
  ): AsyncGenerator<any, void, void> {
    let strsProcessed = 0;
    for (const codec of this.codecs) {
      const isStr = codec.deserialise.length > 1 && !(codec instanceof MCJSON);
      yield await codec.deserialise(consumer, isStr ? stringLens[strsProcessed] as $TSFix : void 0);
      if (isStr) strsProcessed++;
    }
  }
}

export default PacketCodec;
