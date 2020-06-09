import nanoid from "nanoid/mod.ts";

import { Logger } from "../utils/logger.ts";

import { Consumer } from "./consumer.ts";

import Conn = Deno.Conn;

export const enum State {
  HANDSHAKE,
  STATUS,
  LOGIN,
  PLAY,
}

export class Context {
  public state = State.HANDSHAKE;
  public id = nanoid(8);
  public log: Logger;

  readonly #consumer: Consumer;
  #shouldClose = false;
  #closed = false;

  public constructor(private conn: Conn, log: Logger) {
    this.log = log.child(this.id);
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
