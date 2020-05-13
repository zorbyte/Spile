import { createServer, Server as TCPServer, Socket } from "net";

import { stop } from "@lib/mediator";

import SimpleServer from "../SimpleServer";

import Client from "./Client";
import { initPacketCodec } from "./packetCodec";

class ProtoServer extends SimpleServer<TCPServer> {
  public server = createServer();

  private clients: Client[] = [];

  public constructor() {
    // TODO; Do not hard code this port, retrieve it form the user config.
    super("protocol", 25565);

    initPacketCodec()
      .then(() => {
        this.server.on("connection", this.handleConnection.bind(this));
      })
      .catch(async err => {
        this.log.quickError("Failed to initialise packet codec!", err);
        await stop();
      });
  }

  // Called when a socket connects.
  private handleConnection(socket: Socket): void {
    this.log.debug("Connection established!");

    const newClient = new Client(socket, this.log);

    this.clients.push(newClient);
  }
}

export default ProtoServer;
