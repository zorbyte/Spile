import { concatArrays } from "../io_util.ts";

function collator() {
  let length = 0;
  let collected: Uint8Array[] = [];

  function insert(): Uint8Array;
  function insert(data: Uint8Array, action: "prepend" | "replace"): void;
  function insert(
    data?: Uint8Array,
    action?: "prepend" | "replace",
  ): Uint8Array | void {
    if (!data) return concatArrays(collected, length);
    if (action && action === "replace") {
      length = data.length;
      collected = [data];
    }
    length += data.length;
    collected[action === "prepend" ? "unshift" : "push"](data);
  }

  return insert;
}

export default collator;
