import { concatArrays, MAX_PACKET_SIZE } from "./io_utils.ts";

import Reader = Deno.Reader;
import { SError } from "../utils/errors/mod.ts";

export class Consumer {
  #offset = 0;
  #peakedOffset = 0;
  #historyLength = 0;
  #peaked: Uint8Array | undefined = void 0;
  #history: Uint8Array[] = [];
  #recordHistory = false;

  public constructor(
    private reader: Reader,
    public maxOffset = MAX_PACKET_SIZE,
  ) {}

  public get offset() {
    return this.#offset;
  }

  public get peakedOffset() {
    return this.#peakedOffset;
  }

  public async peak(amount: number) {
    const data = await this.read(amount);
    this.#peaked = data;
    this.#peakedOffset += amount;

    return data;
  }

  public recordHistory(mode = true) {
    if (!mode) {
      this.#history = [];
      this.#historyLength = 0;
    }

    this.#recordHistory = mode;
  }

  public getHistory() {
    return { history: this.#history, length: this.#historyLength };
  }

  public async read(amount: number) {
    let priorPortion: Uint8Array | undefined = void 0;
    let readMore = false;

    // TODO: Clean this up, there is probably a better way to do this.
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

      priorPortion = this.#peaked.subarray(0, allowedReadAmount);

      if (empty) this.#peaked = void 0;
    }

    let finalData!: Uint8Array;

    if (priorPortion) {
      if (readMore) {
        const data = await this.readIntoArray(amount);
        finalData = concatArrays(
          [priorPortion, data],
          priorPortion.length + data.length,
        );
      } else {
        finalData = priorPortion;
      }
    } else {
      finalData = await this.readIntoArray(amount);
    }

    if (this.#recordHistory) {
      // TODO: Check if this needs to be sliced or subarrayed.
      this.#history.push(finalData.subarray());
      this.#historyLength += finalData.length;
    }

    return finalData;
  }

  public async readWithView(amount: number): Promise<DataView> {
    const data = await this.read(amount);
    return new DataView(data.buffer);
  }

  public empty() {
    this.#offset = 0;
    this.#peakedOffset = 0;
    this.#peaked = void 0;
  }

  private changeOffset(amount: number) {
    const newOffset = this.#offset + amount;
    if (newOffset > this.maxOffset) {
      throw new Error("Can not read outside bounds of consumer!");
    }

    this.#offset = newOffset;
  }

  private async readIntoArray(
    amount: number,
  ) {
    const data = new Uint8Array(amount);
    const amountRead = await this.reader.read(data);
    if (amountRead !== null && amountRead > 0) {
      this.changeOffset(amount);
      return data;
    }

    throw new SError("CONNECTION_CLOSED");
  }
}
