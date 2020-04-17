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

import { Server } from "http";

import Spile from "@lib/Spile";
import SimpleServer from "@structs/base/SimpleServer";

class RConServer extends SimpleServer<Server> {
  protected server = new Server();

  public constructor(spile: Spile) {
    // TODO: Use the config to get this value.
    super("rcon", 25575, spile);
  }

  public async listen(): Promise<void> {
    await this._listen();
    this.log.info(`Rcon server listening on ${this.port}.`);
  }

  public async close(): Promise<void> {
    this.log.debug("Closing rcon server.");
    await this._close();
    this.log.info("Closed rcon server.");
  }
}

export default RConServer;
