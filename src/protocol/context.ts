import { BaseContextHolder } from "./base_context_holder.ts";
import { ProtocolHeaders } from "./io_utils.ts";
import { Client } from "./client.ts";

export class Context<P extends ProtocolHeaders> extends BaseContextHolder {
  public ended = false;

  public constructor(private client: Client, public packet: P) {
    super("ctx", client.log);
  }

  public get state() {
    return this.client.state;
  }

  public close() {
    this.client.close();
  }

  public get closed() {
    return this.client.closed;
  }

  public get closing() {
    return this.client.shouldClose;
  }
}
