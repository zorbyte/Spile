import { deferred } from "../deps.ts";

export class Queue<T> {
  private current = deferred<T | void>();

  public add(data: T) {
    this.current.resolve(data);
  }

  public stop(reason?: string | Error) {
    if (reason) {
      if (typeof reason === "string") reason = new Error(reason);
      return this.current.reject(reason);
    }

    this.current.resolve();
  }

  private async *iterate(): AsyncIterableIterator<T> {
    const res = await this.current;
    if (typeof res === "undefined") return;
    yield res;
    this.current = deferred();
    yield* this.iterate();
  }

  public [Symbol.asyncIterator]() {
    return this.iterate();
  }
}
