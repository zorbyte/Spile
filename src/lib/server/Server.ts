/**
 * Spile Minecraft Server
 * @author zorbyte <zorbytee@gmail.com>
 *
 * @license
 * Copyright (C) 2020 The Spile Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https: //www.gnu.org/licenses/>.
 */

import { createServer, Server as TCPServer } from "net";

import Spile from "@lib/Spile";
import Codec from "@structs/base/PacketCodec";
import SimpleServer from "@structs/base/SimpleServer";

class Server extends SimpleServer<TCPServer> {
  protected server = createServer();

  public constructor(spile: Spile) {
    // TODO; Do not hard code this.
    super("server", 25565, spile);
    this.server.on("connection", _socket => this.log.info("Connection established!"));
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
}

export default Server;

