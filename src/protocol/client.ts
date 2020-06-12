import { Logger } from "@utils/logger.ts";

import { BaseContextHolder } from "./base_context_holder.ts";
import { Consumer } from "./consumer.ts";

import Conn = Deno.Conn;

export const enum State {
  HANDSHAKE,
  STATUS,
  LOGIN,
  PLAY,
}

export class Client extends BaseContextHolder {
  public state = State.HANDSHAKE;

  readonly #consumer: Consumer;
  #shouldClose = false;
  #closed = false;

  public constructor(private conn: Conn, log: Logger) {
    super("client", log);
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
      this.conn.close();
      this.#closed = true;
    } else {
      this.#shouldClose = true;
    }
  }
}
