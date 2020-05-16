const kLength = Symbol.for("length");

class BufferProducer {
  public raw: Buffer[] = [];

  private [kLength] = 0;

  public get length() {
    return this[kLength];
  }

  public prepend(buffer: Buffer) {
    this.raw.unshift(buffer);
    this.addLength(buffer);
  }

  public append(buffer: Buffer) {
    this.raw.push(buffer);
    this.addLength(buffer);
  }

  public compile(): Buffer {
    const newBuffer = Buffer.concat(this.raw, this[kLength]);
    return newBuffer;
  }

  public replace(buffer: Buffer) {
    this.raw = [buffer];
    this[kLength] = buffer.length;
  }

  private addLength(buffer: Buffer) {
    this[kLength] += buffer.length;
  }
}

export default BufferProducer;
