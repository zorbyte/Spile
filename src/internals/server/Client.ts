import { Socket } from "net";
import { EventEmitter } from "events";

export enum EState {
  SHAKE,
  STATS,
  LOGIN,
  PLAY,
}

class Client extends EventEmitter {
  public state: EState = EState.SHAKE;
  public constructor(private socket: Socket) {
    super();
    // Consider disabling Naggle's algorithm if the latency isn't good.
    // this.socket.setNoDelay(true);
    // @ts-ignore
    this.socket.on("data", (data: Uint8Array) => { /* noop */ }); // eslint-disable-line no-inline-comments
  }
}

export default Client;
