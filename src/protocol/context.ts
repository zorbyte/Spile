import { createLogger } from "@utils/logger.ts";
import { ProtocolHeaders } from "./io_utils.ts";

const ctxLog = createLogger("protocol", ["req"]);

export const enum State {
  HANDSHAKE,
  STATUS,
  LOGIN,
  PLAY,
}

export class Context<P extends ProtocolHeaders> {
  public log = ctxLog;

  #closeOnEnd = false;

  public constructor(public packet: P, public state: State) {}

  public get closeOnEnd() {
    return this.#closeOnEnd;
  }

  public close() {
    this.#closeOnEnd = true;
  }
}
