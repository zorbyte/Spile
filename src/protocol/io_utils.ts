import { PickByValue } from "@utils/type_utils.d.ts";

import { varInt } from "./fields/var_int.ts";
import { Consumer } from "./consumer.ts";
import { SError } from "../utils/errors/mod.ts";
import { Collator } from "./collator.ts";

export const MAX_PACKET_SIZE = 1_000_000;

/** Concatenates Uint8Arrays into a single one. */
export function concatArrays(arrays: Uint8Array[], length: number) {
  const output = new Uint8Array(length);
  let prevPos = 0;
  for (const array of arrays) {
    output.set(array, prevPos);
    prevPos += array.length;
  }

  return output;
}

/**
 * Gets the Uint8Array using the name of the
 * DataView method applied to the data
 */
export function getBytesOfNumber(
  length: number,
  value: number,
  method: keyof PickByValue<DataView, Function>,
) {
  const bytes = new Uint8Array(length);
  const view = new DataView(bytes.buffer);
  (view[method] as (offset: number, value: number) => number)(0, value);

  return bytes;
}

export interface ProtocolHeaders {
  readonly packetLength: number;
  readonly dataLength: number;
  readonly id: number;
}

export interface ProtocolHeadersOpts {
  compressed: boolean;
  compressionThreshold: number;
  encrypted: boolean;
}

/** Encodes the headers for an outbound packet. */
export async function encodeHeaders(
  col: Collator,
  opts: ProtocolHeadersOpts,
) {
  checkHeaderOptions(opts);
  const packetLength = col.length;
  col.prepend(await varInt.encode(packetLength));
}

/** Decodes the headers of a request */
export async function decodeHeaders(cons: Consumer, opts: ProtocolHeadersOpts) {
  checkHeaderOptions(opts);

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

/** Checks if the header options violate a set of requirements. */
function checkHeaderOptions(opts: ProtocolHeadersOpts) {
  if (opts.compressed || opts.encrypted) throw new SError("NOT_IMPLEMENTED");
}
