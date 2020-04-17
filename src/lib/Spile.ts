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
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https: //www.gnu.org/licenses/>.
 */

import { EventEmitter } from "events";

import { VERSION } from "@root/config";
import QueryServer from "@root/query/QueryServer";
import RConServer from "@root/rcon/RconServer";
import Server from "@root/server/Server";
import Environment from "@structs/Environment";
import Logger, { calculateLevel } from "@structs/Logger";

class Spile extends EventEmitter {
  /**
   * The version of Spile running. Useful for comparing the version against versions registered in plugins.
   */
  public version = VERSION;

  /**
   * Logger instance for the master.
   */
  public log = new Logger("Master", calculateLevel(Environment));

  /**
   * The rcon server.
   */
  private rcon = new RConServer(this);

  /**
   * The query server.
   */
  private query = new QueryServer(this);

  /**
   * The main minecraft server.
   */
  private server = new Server(this);

  private isBooting = true;

  public constructor() {
    super();
    this.log.start("Bootstrapping server...");
  }

  public async start(): Promise<void> {
    try {
      await Promise.all([this.rcon.listen(), this.server.listen(), this.query.listen()]);
      this.isBooting = false;
      this.log.stop.info("We're ready to roll boss!");
      this.log.startRL();
    } catch (err) {
      if (this.isBooting) {
        this.log.error("An error occurred while booting!", err);
        this.log.warn("The server will now stop.");
        this.stop();
      } else {
        this.log.error("An error occurred in Spile! Please report this to the developers.", err);
      }
    }
  }

  public async stop(): Promise<void> {
    try {
      this.log.closeRL();
      this.log.warn("Stopping server!!!");
      this.log.start("Cleaning up server...");
      this.log.debug("Closing all servers.");
      await Promise.all([this.rcon.close, this.server.close, this.query.close]);
      this.log.info("Successfully closed all servers!");
      this.log.stop.debug("Thanks for playing!");
      this.log.close();
      process.exit(0);
    } catch (err) {
      this.log.error(`An error occurred while stopping the server! Please report this! The server will now close dirtily.`, err);
      this.log.emergencyDestroy();
      process.exit(1);
    }
  }
}

export default Spile;
