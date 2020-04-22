import { Server } from "http";

import Spile from "@internals/Spile";

import SimpleServer from "../SimpleServer";

class RConServer extends SimpleServer<Server> {
  protected server = new Server();

  public constructor(spile: Spile) {
    // TODO: Use the config to get this value.
    super("rcon", 25575, spile);
  }

  public async listen(): Promise<void> {
    this.log.info(`Opening rcon server on ${this.port}.`);
    await this._listen();
  }

  public async close(): Promise<void> {
    this.log.debug("Closing rcon server.");
    await this._close();
  }
}

export default RConServer;
