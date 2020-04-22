class Incoming {
  private pos = 0;

  public constructor(private raw: Uint8Array) {}

  public consume(amnt: number): Uint8Array | void {
    amnt += this.pos;
    if (amnt > this.raw.byteLength) return;
    this.raw = this.raw.copyWithin(this.pos, amnt);
    this.pos = amnt;
    return this.raw;
  }
}

export default Incoming;
