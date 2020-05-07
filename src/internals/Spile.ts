import { EventEmitter } from "events";

import CLI from "@internals/console/CLI";
import Logger, { calculateLevel } from "@internals/console/Logger";
import QueryServer from "@net/query/QueryServer";
import RConServer from "@net/rcon/RconServer";
import Server from "@net/server/Server";
import { VERSION } from "@root/config";
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
    this.log.info(`Welcome to Spile v${this.version}, written by zorbyte.`);
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
        await this.stop();
      } else {
        this.log.error("An error occurred in Spile! Please report this to the developers.", err);
      }
    }
  }

  public async stop(): Promise<never> {
    try {
      this.cli.closePrompt();
      this.log.warn("Stopping server.");
      this.cli.startSpinner("Cleaning up...");
      await Promise.all([this.rcon.close(), this.server.close(), this.query.close()]);
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
