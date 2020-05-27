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

export interface Consumer {
  (): number;
  (amount: number): Uint8Array;
  (amount: number, changeLen: true): void;
  (amount?: number, changeLen?: boolean): Uint8Array | number | void;
}

export function consumer(
  buffer: Uint8Array,
  maxLength = buffer.length,
): Consumer {
  let offset = 0;

  // Returns offset if no arguments supplied.
  // Returns a slice of the buffer if amount is supplied.
  // Extends the maximum length if the extend argument is supplied with true.
  function consume(): number;
  function consume(amount: number): Uint8Array;
  function consume(amount: number, changeLen: true): void;
  function consume(
    amount?: number,
    changeLen?: boolean,
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
    const section = buffer.subarray(offset, endOffset);
    offset = endOffset;

    return section;
  }

  return consume;
}

export type VarType = "int" | "long";

export function decodeVarType(data: Uint8Array, type: VarType) {
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

const SIGNIFICANT_HEADER_LEN = 10;
const VarIntStub = (_data: Uint8Array) => 0;

export async function parseHeaders(
  reader: Reader,
  _opts: HeaderParserOpts,
): Promise<ProtoHeaders | null> {
  let i = 0;
  const fields: Uint8Array[] = [];
  const collected = new Uint8Array(SIGNIFICANT_HEADER_LEN);
  const readAmnt = await reader.read(collected);

  if (readAmnt === null || readAmnt < SIGNIFICANT_HEADER_LEN) return null;

  // A header either compressed or uncompressed will have two visible fields
  // both of which are VarInts. A VarInt has a max size of 5 bytes.
  for await (const chunk of Deno.iter(reader, { bufSize: 5 })) {
    if (i > 1) break;
    fields[i] = chunk;
    i++;
  }

  if (fields.length === 0) return null;

  const headers: Partial<ProtoHeaders> = {};

  [headers.packetLength, headers.dataLength] = fields.map(VarIntStub);

  headers.id = 0;

  return headers as ProtoHeaders;
}
