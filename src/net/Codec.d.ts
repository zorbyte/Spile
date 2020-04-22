import Incoming from "./server/Incoming";

export default interface Codec<T> {
  serialise: (data: T) => Promise<Uint8Array> | Uint8Array;
  deserialise: (raw: Incoming) => Promise<T> | T;
}
