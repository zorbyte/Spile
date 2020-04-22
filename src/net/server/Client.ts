import { EventEmitter } from "events";
import { Socket } from "net";

import Incoming from "./Incoming";

export enum State {
  SHAKE,
  STATS,
  LOGIN,
  PLAY,
}

class Client extends EventEmitter {
  public state = State.SHAKE;

  public constructor(private socket: Socket) {
    super();
    // Consider disabling Naggle's algorithm if the latency isn't good.
    // this.socket.setNoDelay(true);
    this.socket.on("data", (data: Uint8Array) => {
      // @ts-ignore 6133
      const incomingMsg = new Incoming(data);
    });
  }
}

export default Client;
