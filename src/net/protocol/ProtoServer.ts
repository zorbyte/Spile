import { createServer, Server as TCPServer, Socket } from "net";

import Logger from "@utils/Logger";

import SimpleServer from "../SimpleServer";

import Client from "./Client";

type ErrorHandler = (err: Error) => void;


class ProtoServer extends SimpleServer<TCPServer> {
  public server = createServer();
  private handleError = buildDefErrHandler(this.log);

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  private clients: Client[];

  public constructor() {
    // TODO; Do not hard code this port, retrieve it form the user config.
    super("server", 25565);
    this.server.on("connection", this.handleConnection.bind(this));
  }

  public async listen() {
    this.log.info(`Opening main server on ${this.port}.`);
    await this._listen();
  }

  public async close() {
    this.log.info("Closing main server.");
    await this._close();
  }

  public throwError(err: Error) {
    this.handleError(err);
  }

  public onError(handler: ErrorHandler) {
    this.handleError = handler;
  }

  private handleConnection(socket: Socket): void {
    this.log.debug("Connection established!");

    const _newClient = new Client(socket, this.log);

    this.clients.push(_newClient);
  }
}

function buildDefErrHandler(log: Logger): ErrorHandler {
  return err => log.error("An error occurred in the protocol server!\n", err);
}

export default ProtoServer;
