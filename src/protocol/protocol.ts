function consumer(buffer: Uint8Array, maxLength = buffer.length) {
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
    const section = buffer.slice(offset, endOffset);
    offset = endOffset;

    return section;
  }

  return consume;
}

export default consumer;
