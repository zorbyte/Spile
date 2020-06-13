import { createLogger, Logger } from "@utils/logger.ts";
import { ProtocolHeaders } from "./io_utils.ts";

const ctxLog = createLogger("protocol", ["req"]);

export const enum State {
  HANDSHAKE,
  STATUS,
  LOGIN,
  PLAY,
}

export interface Context<P extends ProtocolHeaders> {
  readonly closeOnEnd: boolean;
  packet: P;
  state: State;
  log: Logger;
  close(): void;
}

export function createContext<P extends ProtocolHeaders>(
  packet: P,
  state: State,
) {
  let closeOnEnd = false;

  return {
    packet,
    state,

    log: ctxLog,

    get closeOnEnd() {
      return closeOnEnd;
    },

    close() {
      closeOnEnd = true;
    },
  };
}
