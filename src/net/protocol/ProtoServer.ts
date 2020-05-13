import { createServer, Server as TCPServer, Socket } from "net";

import { stop } from "@lib/mediator";

import SimpleServer from "../SimpleServer";

import Client from "./Client";
import { initPacketCodec } from "./packetCodec";

class ProtoServer extends SimpleServer<TCPServer> {
  public server = createServer();

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  private clients: Client[];

  public constructor() {
    // TODO; Do not hard code this port, retrieve it form the user config.
    super("server", 25565);

    initPacketCodec()
      .then(() => {
        this.server.on("connection", this.handleConnection.bind(this));
      })
      .catch(async err => {
        this.log.quickError("Failed to initialise packet codec!", err);
        await stop();
      });
  }

  public async listen() {
    this.log.debug(`Opening main server on ${this.port}.`);
    await this._listen();
  }

  public async close() {
    this.log.debug("Closing main server.");
    await this._close();
  }

  // Called when a socket connects.
  private handleConnection(socket: Socket): void {
    this.log.debug("Connection established!");

    const newClient = new Client(socket, this.log);

    this.clients.push(newClient);
  }
}

export default ProtoServer;
