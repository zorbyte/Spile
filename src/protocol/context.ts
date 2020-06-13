import { ProtocolHeaders } from "./io_utils.ts";
import { Client, State } from "./client.ts";
import { createLogger } from "../utils/logger.ts";

const ctxLog = createLogger("protocol", ["req"]);

export class Context<P extends ProtocolHeaders> {
  public ended = false;
  public log = ctxLog;

  public constructor(private client: Client, public packet: P) {}

  public get state() {
    return this.client.state;
  }

  public set state(newState: State) {
    this.client.state = newState;
  }

  public close() {
    this.client.close();
  }
}
