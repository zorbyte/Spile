import { concatArrays } from "./io_utils.ts";

export class Collator {
  #collated: Uint8Array[] = [];
  #length = 0;

  public append(data: Uint8Array) {
    this.#collated.push(data);
    this.#length += data.length;
  }

  public prepend(data: Uint8Array) {
    this.#collated.unshift(data);
    this.#length += data.length;
  }

  public replace(data: Uint8Array) {
    this.#collated = [data];
    this.#length = data.length;
  }

  public get length() {
    return this.#length;
  }

  public concat() {
    if (!this.#collated.length) return;

    return this.#collated.length === 1
      ? this.#collated[0]
      : concatArrays(this.#collated, this.#length);
  }
}
