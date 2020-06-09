import Conn = Deno.Conn;

export const enum State {
  HANDSHAKE,
  STATUS,
  LOGIN,
  PLAY,
}

export class Context {
  public state = State.HANDSHAKE;

  #shouldClose = false;
  #closed = false;

  public constructor(private conn: Conn) {}

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
