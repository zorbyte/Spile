class BufferConsumer {
  public offset = 0;

  public constructor(public raw: Buffer) {}

  public replaceBuffer(newBuff: Buffer) {
    this.raw = newBuff;
    this.offset = 0;
  }

  public consume(amnt: number) {
    const endLoc = this.offset + amnt;
    if (endLoc > this.raw.length) throw new Error("Not enough bytes left to be consumed");

    const section = this.raw.slice(this.offset, endLoc);
    this.offset = endLoc;

    return section;
  }

  public drain() {
    const res = this.raw.slice(this.offset);
    this.offset = this.raw.length;

    return res;
  }
}

export default BufferConsumer;
