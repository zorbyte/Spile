import { PickByValue } from "@utils/type_utils.d.ts";

import { varInt } from "./fields/var_int.ts";
import { Consumer } from "./consumer.ts";
import { SError } from "../utils/errors/mod.ts";

export const MAX_PACKET_SIZE = 1_000_000;

export function concatArrays(arrays: Uint8Array[], length: number) {
  const output = new Uint8Array(length);
  let prevPos = 0;
  for (const array of arrays) {
    output.set(array, prevPos);
    prevPos = array.length;
  }

  return output;
}

export function getBytesOfNumber(
  length: number,
  value: number,
  method: keyof PickByValue<DataView, Function>,
) {
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
    data: Uint8Array,
    action: "prepend" | "append" | "replace",
  ): Uint8Array | void;
}

export function collator() {
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

  return insert as Collator;
}

export interface ProtocolHeaders {
  readonly packetLength: number;
  readonly dataLength: number;
  readonly id: number;
}

export interface HeaderParserOpts {
  compressed: boolean;
  compressionThreshold: number;
  encrypted: boolean;
}

export async function parseHeaders(cons: Consumer, opts: HeaderParserOpts) {
  if (opts.compressed) throw new SError("NOT_IMPLEMENTED");

  const packetLength = await varInt.decode(cons);
  const dataLengthOrId = await varInt.decode(cons);
  let dataLength!: number;
  let id!: number;

  if (!opts.compressed) {
    id = dataLengthOrId;
    dataLength = packetLength;
  } else {
    dataLength = await varInt.decode(cons);
  }

  const headers: ProtocolHeaders = {
    packetLength,
    dataLength,
    id,
  };

  return headers;
}
