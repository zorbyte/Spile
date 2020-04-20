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
import CLI from "@utils/console/CLI";
import Logger, { calculateLevel } from "@utils/console/Logger";
import Environment from "@utils/Environment";
import EventBus from "@utils/EventBus";

import chalk from "chalk";

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
   * The CLI for loading animations and the command prompt.
   */
  private cli = new CLI(this);

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
    this.log.info(
      "Welcome to Spile, this software is licensed under the LGPL-3.0 license.",
      `For more information, type ${chalk.grey(".credits")} into the prompt.`,
    );
    if (Environment.normal) {
      this.log.info(
        "To enable debug logging,",
        `configure your environment variables to include ${chalk.grey("R_DEBUG=1")}.`,
      );
    }

    this.cli.startSpinner("Bootstrapping server...");
  }

  public async start(): Promise<void> {
    try {
      await Promise.all([this.rcon.listen(), this.server.listen(), this.query.listen()]);
      this.isBooting = false;
      this.log.debug("Registering critical error handler.");
      EventBus.on("critical", async err => {
        this.log.error("A critical error has occurred! Spile will now shut down.\n", err);
        await this.stop();
      });
      this.cli.stopSpinner();
      this.log.info("We're ready to roll boss!");
      this.cli.openPrompt();
      await EventBus.send("ready");
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

  public async stop(): Promise<never> {
    try {
      this.cli.closePrompt();
      this.log.warn("Stopping server.");
      this.cli.startSpinner("Cleaning up server...");
      this.log.debug("Closing all servers.");
      await Promise.all([this.rcon.close(), this.server.close(), this.query.close()]);
      this.log.debug("Successfully closed all servers!");
      this.cli.stopSpinner();
      this.log.info("Thanks for playing!");
      this.log.finalDestroy();
      process.exit();
    } catch (err) {
      // Don't use the logger, as an error as severe as this could be caused by the logger itself!
      // eslint-disable-next-line no-console
      console.error(
        "An error occurred while stopping the server!",
        "Please report this! The server will now close dirtily.\n",
        err,
      );
      process.exit(1);
    }
  }
}

export default Spile;
