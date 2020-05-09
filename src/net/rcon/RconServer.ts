import { Server } from "http";

import SimpleServer from "../SimpleServer";

class RConServer extends SimpleServer<Server> {
  public server = new Server();

  public constructor() {
    // TODO: Use the config to get the port.
    super("rcon", 25575);
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
