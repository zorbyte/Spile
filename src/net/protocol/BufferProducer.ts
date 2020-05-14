const kLength = Symbol.for("length");
const kByteLength = Symbol.for("byteLength");

class BufferProducer {
  public raw: Buffer[] = [];

  private [kLength] = 0;
  private [kByteLength] = 0;

  public get length() {
    return this[kLength];
  }

  public get byteLength() {
    return this[kByteLength];
  }

  public prepend(buffer: Buffer) {
    this.raw.unshift(buffer);
    this.addLength(buffer);
  }

  public append(buffer: Buffer) {
    this.raw.push(buffer);
    this.addLength(buffer);
  }

  public complete(): Buffer {
    const newBuffer = Buffer.concat(this.raw, this[kLength]);
    return newBuffer;
  }

  public replace(buffer: Buffer) {
    this.raw = [buffer];
    this[kLength] = buffer.length;
    this[kByteLength] = buffer.byteLength;
  }

  private addLength(buffer: Buffer) {
    this[kLength] += buffer.length;
    this[kByteLength] += buffer.byteLength;
  }
}

export default BufferProducer;
