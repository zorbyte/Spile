import { concatArrays, MAX_PACKET_SIZE } from "./io_utils.ts";

import Reader = Deno.Reader;

export class Consumer {
  #offset = 0;
  #readSoFar = 0;

  public constructor(private reader: Reader, public maxOffset = MAX_PACKET_SIZE) {}

  public get offset() {
    return this.#offset;
  }

  public async read(amount: number) {
    const [data] = await this.readIntoArray(amount);
    if (!data) throw new Error("No data to read.");
    return data;
  }

  public async readWithView(amount: number): Promise<[number, DataView]> {
    const [data, prevOffset] = await this.readIntoArray(amount);
    if (!data) throw new Error("No data to read.");
    return [prevOffset, new DataView(data)];
  }

  public changeOffset(amount: number) {
    const newOffset = this.offset + amount;
    if (newOffset > this.maxOffset) {
      throw new Error("Can not read outside bounds of consumer!");
    }

    // The new offset is assigned to offset.
    const oldOffset = this.#offset;
    this.#offset = newOffset;

    return oldOffset;
  }

  private async readIntoArray(amount: number): Promise<[Uint8Array | void, number]> {
    const data = new Uint8Array(amount);
    const amountRead = await this.reader.read(data);
    if (amountRead !== null && amountRead > 0) {
      this.#readSoFar += amountRead;
      const oldOffset = this.changeOffset(amount);
      const offsetDiff = this.#offset - this.#readSoFar;
      let finalData = data;
      if (offsetDiff > 0) {
        const validData = data.slice(offsetDiff);
        const extValidData = new Uint8Array(offsetDiff);
        const extAmountRead = await this.reader.read(extValidData);
        if (extAmountRead === null || amountRead === 0) {
          throw new Error("Can not read data in area of a pre-maturely extended offset.");
        }

        finalData = concatArrays(
          [validData, extValidData],
          validData.length + extValidData.length,
        );
      }

      return [finalData, oldOffset];
    }

    return [void 0, 0];
  }
}
