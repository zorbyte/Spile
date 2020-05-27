import { varInt } from "./fields/var_int.ts";
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

export interface Collator {
  (): Uint8Array;
  (data: Uint8Array, action: "prepend" | "append" | "replace"): void;
  (
    data?: Uint8Array,
    action?: "prepend" | "append" | "replace"
  ): Uint8Array | void;
}

export function collator(): Collator {
  let length = 0;
  let buffered: Uint8Array[] = [];

  function insert(): Uint8Array;
  function insert(
    data: Uint8Array,
    action: "prepend" | "append" | "replace"
  ): void;
  function insert(
    data?: Uint8Array,
    action?: "prepend" | "append" | "replace"
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

export interface Consumer {
  (): number;
  (amount: number): Uint8Array;
  (amount: number, changeLen: true): void;
  (amount?: number, changeLen?: boolean): Uint8Array | number | void;
}

export function consumer(data: Uint8Array, maxLength = data.length): Consumer {
  let offset = 0;

  // Returns offset if no arguments supplied.
  // Returns a slice of the buffer if amount is supplied.
  // Extends the maximum length if the extend argument is supplied with true.
  function consume(): number;
  function consume(amount: number): Uint8Array;
  function consume(amount: number, changeLen: true): void;
  function consume(
    amount?: number,
    changeLen?: boolean
  ): Uint8Array | number | void {
    if (typeof amount === "undefined") {
      return offset;
    } else if (changeLen) {
      maxLength += amount;
      return;
    }

    const endOffset = offset + amount;
    if (endOffset > maxLength) {
      throw new Error("Can not read outside bounds of consumer!");
    }
    const section = data.subarray(offset, endOffset);
    offset = endOffset;

    return section;
  }

  return consume;
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
  _opts: HeaderParserOpts
): Promise<ProtoHeaders | null> {
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
