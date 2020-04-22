import { createServer, Server as TCPServer, Socket } from "net";

import Spile from "@internals/Spile";
import Codec from "@net/server/codecs/PacketCodec";
import SimpleServer from "@net/SimpleServer";

import Client from "./Client";
import Packet from "./Packet";

class Server extends SimpleServer<TCPServer> {
  protected server = createServer();
  private clients: Client[];

  public constructor(spile: Spile) {
    // TODO; Do not hard code this.
    super("server", 25565, spile);
    Packet.bindLogger(this.log);
    this.server.on("connection", this.handleConnection);
  }

  public encode(_packet: Codec<any>): void {
    this.log.debug("Encoding packet!");
  }

  public async listen(): Promise<void> {
    this.log.info(`Opening main server on ${this.port}.`);
    await this._listen();
  }

  public async close(): Promise<void> {
    this.log.info("Closing main server.");
    await this._close();
  }

  private handleConnection(socket: Socket): void {
    this.log.debug("Connection established!");
    const newClient = new Client(socket, this.log);
  }
}

export default Server;

