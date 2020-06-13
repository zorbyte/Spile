import { Logger } from "@utils/logger.ts";

import { Consumer } from "./consumer.ts";

import Conn = Deno.Conn;

export const enum State {
  HANDSHAKE,
  STATUS,
  LOGIN,
  PLAY,
}

export class Client {
  public state = State.HANDSHAKE;

  readonly #consumer: Consumer;
  #shouldClose = false;
  #closed = false;

  public constructor(private conn: Conn, public log: Logger) {
    this.#consumer = new Consumer(conn);
  }

  public get consumer() {
    if (this.#closed) throw new Error("Can not use consumer while closed.");
    return this.#consumer;
  }

  public get closed() {
    return this.#closed;
  }

  public get shouldClose() {
    return this.#shouldClose;
  }

  public close(immediate = false) {
    if (immediate) {
      this.#shouldClose = false;
      this.#consumer.empty();
      this.conn.close();
      this.#closed = true;
    } else {
      this.#shouldClose = true;
    }
  }
}
