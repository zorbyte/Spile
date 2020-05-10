import Packet from "@root/server/packets/Packet";

// TODO: Fix these types to align with the new Proxy based server stuff.

export type Predicate<T extends any[]> = (...args: T) => boolean;
export type $TSFix = any;

// @url https://stackoverflow.com/questions/53503813/get-dictionary-object-keys-as-tuple-in-typescript

/* helpers */
type Overwrite<T, S extends any> = { [P in keyof T]: S[P] };
type TupleUnshift<T extends any[], X> = T extends any ?
  ((x: X, ...t: T) => void) extends (...t: infer R) => void ? R : never : never;
type TuplePush<T extends any[], X> = T extends any ? Overwrite<TupleUnshift<T, any>, T & { [x: string]: X }> : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type UnionToOvlds<U> = UnionToIntersection<U extends any ? (f: U) => void : never>;
type PopUnion<U> = UnionToOvlds<U> extends ((a: infer A) => void) ? A : never;
/* end helpers */
/* main work */
type UnionToTupleRecursively<T extends any[], U> = {
  1: T;
  0: PopUnion<U> extends infer SELF ? UnionToTupleRecursively<TuplePush<T, SELF>, Exclude<U, SELF>> : never;
}[[U] extends [never] ? 1 : 0];
/* end main work */

export type UnionToTuple<U> = UnionToTupleRecursively<[], U>;

// eslint-disable-next-line max-len
// @url https://stackoverflow.com/questions/59658536/how-to-write-an-invert-type-in-typescript-to-invert-the-order-of-tuples
export type Prepend<Tuple extends any[], Addend> =
  ((_: Addend, ..._1: Tuple) => any) extends ((..._: infer Result) => any) ? Result : never;

export type Reverse<Tuple extends any[], Prefix extends any[] = []> = {
  0: Prefix;
  1: ((..._: Tuple) => any) extends ((_: infer First, ..._1: infer Next) => any)
    ? Reverse<Next, Prepend<Prefix, First>>
    : never;
}[Tuple extends [any, ...any[]] ? 1 : 0];

export type PacketKeys<P extends Packet<P>> =
  Reverse<UnionToTuple<Exclude<keyof P, "id" | "serialise" | "deserialise">>>;
