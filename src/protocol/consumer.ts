import { concatArrays, MAX_PACKET_SIZE } from "./io_utils.ts";

import Reader = Deno.Reader;
import { SError } from "../utils/errors/mod.ts";

export class Consumer {
  #offset = 0;
  #peaked: Uint8Array | undefined = void 0;
  #peakedOffset = 0;

  public constructor(
    private reader: Reader,
    public maxOffset = MAX_PACKET_SIZE,
  ) {}

  public get offset() {
    return this.#offset;
  }

  public async peak(amount: number) {
    const [data] = await this.readIntoArray(amount);

    const newPeakOffset = this.#peakedOffset + amount;
    if (this.#peaked) {
      this.#peaked = concatArrays([this.#peaked, data], newPeakOffset);
    } else {
      this.#peaked = data;
    }

    this.#peakedOffset = newPeakOffset;

    return data;
  }

  public async read(amount: number) {
    let priorPortion: Uint8Array | undefined = void 0;
    let readMore = false;

    if (this.#peaked && this.#peakedOffset > 0) {
      let empty = false;
      let allowedReadAmount = this.#peakedOffset - amount;
      if (allowedReadAmount <= 0) {
        amount = allowedReadAmount * -1;
        allowedReadAmount = this.#peakedOffset;
        this.#peakedOffset = 0;
        empty = true;
      } else {
        this.#peakedOffset -= allowedReadAmount;
        readMore = true;
      }

      priorPortion = this.#peaked.slice(0, allowedReadAmount);

      if (empty) this.#peaked = void 0;
    }

    let finalData!: Uint8Array;

    if (priorPortion) {
      if (readMore) {
        const [data] = await this.readIntoArray(amount);
        finalData = concatArrays(
          [priorPortion, data],
          priorPortion.length + data.length,
        );
      } else {
        finalData = priorPortion;
      }
    } else {
      [finalData] = await this.readIntoArray(amount);
    }

    return finalData;
  }

  public async readWithView(amount: number): Promise<DataView> {
    const data = await this.read(amount);
    return new DataView(data.buffer);
  }

  public end() {
    this.#offset = 0;
    this.#peakedOffset = 0;
    this.#peaked = void 0;
  }

  private changeOffset(amount: number) {
    const newOffset = this.#offset + amount;
    if (newOffset > this.maxOffset) {
      throw new Error("Can not read outside bounds of consumer!");
    }

    // The new offset is assigned to offset.
    const oldOffset = this.#offset;
    this.#offset = newOffset;

    return oldOffset;
  }

  private async readIntoArray(
    amount: number,
  ): Promise<[Uint8Array, number]> {
    const data = new Uint8Array(amount);
    const amountRead = await this.reader.read(data);
    if (amountRead !== null && amountRead > 0) {
      const oldOffset = this.changeOffset(amount);
      return [data, oldOffset];
    }

    throw new SError("CONNECTION_CLOSED");
  }
}
