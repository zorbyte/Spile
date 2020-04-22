import ByteConsumer from "../ByteConsumer";

export default interface TypeCodec<T> {
  serialise: (data: T) => Promise<Buffer>;
  deserialise: (raw: ByteConsumer) => Promise<T>;
}
