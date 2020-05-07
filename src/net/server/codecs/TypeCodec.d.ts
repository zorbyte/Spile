import ByteConsumer from "./ByteConsumer";

export type StringLength<T> = T extends string ? [number] : [undefined?];
export default interface TypeCodec<T> {
  serialise: (data: T, ...n: StringLength<T>) => Promise<Buffer> | Buffer;
  deserialise: (consumer: ByteConsumer, ...n: StringLength<T>) => Promise<T> | T;
}
