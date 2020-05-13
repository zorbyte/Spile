import { Server } from "http";

import SimpleServer from "../SimpleServer";

class RConServer extends SimpleServer<Server> {
  public server = new Server();

  public constructor() {
    // TODO: Use the config to get the port.
    super("rcon", 25575);
  }
}

export default RConServer;
