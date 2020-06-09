import { varInt } from "./fields/var_int.ts";
import { PickByValue } from "../utils/type_utils.d.ts";
import Reader = Deno.Reader;

export function concatArrays(arrays: Uint8Array[], length: number) {
  const output = new Uint8Array(length);
  let prevPos = 0;
  for (const array of arrays) {
    output.set(array, prevPos);
    prevPos = array.length;
  }

  return output;
}

export function getNumberBytes(
  length: number,
  value: number,
  method: keyof PickByValue<DataView, Function>,
): Uint8Array {
  const bytes = new Uint8Array(length);
  const view = new DataView(bytes);
  (view[method] as (offset: number, value: number) => number)(0, value);

  return bytes;
}

type CollatorAction = "prepend" | "append" | "replace";

export interface Collator {
  (): Uint8Array;
  (data: Uint8Array, action: CollatorAction): void;
  (
    data?: Uint8Array,
    action?: "prepend" | "append" | "replace",
  ): Uint8Array | void;
}

export function collator(): Collator {
  let length = 0;
  let buffered: Uint8Array[] = [];

  function insert(): Uint8Array;
  function insert(
    data: Uint8Array,
    action: "prepend" | "append" | "replace",
  ): void;
  function insert(
    data?: Uint8Array,
    action?: "prepend" | "append" | "replace",
  ): Uint8Array | void {
    if (!data) return concatArrays(buffered, length);
    if (action && action === "replace") {
      length = data.length;
      buffered = [data];
    }
    length += data.length;
    buffered[action === "prepend" ? "unshift" : "push"](data);
  }

  return insert;
}

export type ConsumerAction = "view" | "read" | "offset" | "changeMaxOffset";
type ConsumerReturnTypes =
  | void
  | number
  | [number, DataView]
  | DataView
  | Uint8Array;

export interface Consumer {
  (
    action: ConsumerAction,
    amount: number,
  ): ConsumerReturnTypes;
  (action: "offset"): number;
  (action: "read", amount: number): Uint8Array;
  (action: "view", amount: number): [number, DataView];
  (action: "changeMaxOffset", amount: number): void;
}

export function consumer(data: Uint8Array, maxOffset = data.length) {
  let offset = 0;
  let view!: DataView;

  function consume(
    action: ConsumerAction,
    amount?: number,
  ): ConsumerReturnTypes {
    switch (action) {
      case "view":
        // Rule of thumb: Don't read more than the offset you provided!
        if (!view) view = new DataView(data);
        const prevOffset = changeOffset(amount!);
        return [prevOffset, view];
      case "offset":
        return offset;
      case "read":
        const oldOffset = changeOffset(amount!);
        const section = data.subarray(oldOffset, offset);

        return section;
      case "changeMaxOffset":
        maxOffset += amount!;
        break;
    }
  }

  // Returns the old offset.
  function changeOffset(amount: number) {
    const newOffset = offset + amount;
    if (newOffset > maxOffset) {
      throw new Error("Can not read outside bounds of consumer!");
    }

    // The new offset is assigned to offset.
    const oldOffset = offset;
    offset = newOffset;

    return oldOffset;
  }

  return consume as Consumer;
}

export interface ProtoHeaders {
  packetLength: number;
  dataLength: number;
  id: number;
}

export interface HeaderParserOpts {
  compressed: boolean;
  compressionThreshold: number;
  encrypted: boolean;
}

// A header either compressed or uncompressed will have two visible fields
// both of which are VarInts. A VarInt has a max size of 5 bytes.
const SIGNIFICANT_HEADER_LEN = 10;

export async function parseHeaders(
  reader: Reader,
  _opts: HeaderParserOpts,
) {
  const collected = new Uint8Array(SIGNIFICANT_HEADER_LEN);
  const readAmnt = await reader.read(collected);

  if (readAmnt === null || readAmnt < SIGNIFICANT_HEADER_LEN) return null;

  const cons = consumer(collected, SIGNIFICANT_HEADER_LEN);

  const headers: Partial<ProtoHeaders> = {
    packetLength: await varInt.decode(cons),
    dataLength: await varInt.decode(cons),
  };

  headers.id = 0;

  return headers as ProtoHeaders;
}
