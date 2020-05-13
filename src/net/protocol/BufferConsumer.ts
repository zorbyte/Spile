class BufferConsumer {
  public offset = 0;

  public constructor(public raw: Buffer) {}

  public replaceBuffer(newBuff: Buffer) {
    this.raw = newBuff;
    this.offset = 0;
  }

  public consume(amnt: number) {
    const endLoc = this.offset + amnt;
    if (endLoc > this.raw.length) throw new Error("Not enough bytes left to be consumed!");
    const section = this.raw.slice(this.offset, endLoc);

    this.offset = endLoc;

    return section;
  }

  public drain() {
    this.offset = this.raw.length - 1;

    return this.raw;
  }
}

export default BufferConsumer;
