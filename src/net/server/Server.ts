import { createServer, Server as TCPServer, Socket } from "net";

import Spile from "@internals/Spile";
import Codec from "@net/server/codecs/PacketCodec";
import SimpleServer from "@net/SimpleServer";

import Packet from "./packets/Packet";
import Client from "./Client";

class Server extends SimpleServer<TCPServer> {
  protected server = createServer();

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  private clients: Client[];

  public constructor(spile: Spile) {
    // TODO; Do not hard code this.
    super("server", 25565, spile);
    Packet.bindLogger(this.log);
    this.server.on("connection", this.handleConnection.bind(this));
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

    /* eslint-disable @typescript-eslint/ban-ts-ignore, @typescript-eslint/no-unused-vars */
    // @ts-ignore
    const _newClient = new Client(socket, this.log);
    /* eslint-enable @typescript-eslint/ban-ts-ignore, @typescript-eslint/no-unused-vars */
  }
}

export default Server;
