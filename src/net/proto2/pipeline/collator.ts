function collator() {
  let size = 0;
  let collected: Uint8Array[] = [];

  function insert(): Buffer;
  function insert(data: Uint8Array, action: "prepend" | "replace"): void;
  function insert(data?: Uint8Array, action?: "prepend" | "replace"): Buffer | void {
    if (!data) return Buffer.concat(collected, size);
    if (action && action === "replace") {
      size = data.length;
      collected = [data];
    }
    size += data.length;
    collected[action === "prepend" ? "unshift" : "push"](data);
  }

  return insert;
}

export default collator;
