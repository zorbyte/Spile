class BufferConsumer {
  public pos = 0;
  private current = this.raw;

  public constructor(public raw: Buffer, private size = raw.byteLength) {}

  public replaceBuffer(newBuff: Buffer, size?: number) {
    this.current = newBuff;
    this.size = size || newBuff.length;
    this.pos = 0;
  }

  public consume(amnt: number) {
    if (amnt > this.size) throw new Error("Not enough bytes left to be consumed!");
    const section = this.current.slice(this.pos, amnt);

    this.size -= amnt;
    this.pos += amnt;

    return section;
  }

  public drain() {
    this.pos = this.current.length - 1;
    this.size = 0;

    return this.current;
  }
}

export default BufferConsumer;
