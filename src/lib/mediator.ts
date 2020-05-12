import Command from "@marshal/Command";
import { CommandContext } from "@marshal/CommandContext";
import ProtoServer from "@net/protocol/ProtoServer";
import QueryServer from "@net/query/QueryServer";
import RConServer from "@net/rcon/RconServer";
import Logger, { LoggerLevels } from "@utils/Logger";
import { isDebug } from "@utils/utils";

const log = new Logger("master", isDebug ? LoggerLevels.DEBUG : LoggerLevels.INFO);

// Make it easier for other modules to use the logger without actually naming it log.
export const mainLog = log;

export const commands = new Map<string, Command<CommandContext>>();

let isBooting = true;

const [rcon, proto, query] = [new RConServer(), new ProtoServer(), new QueryServer()];

export async function bootstrap() {
  try {
    await Promise.all([rcon.listen(), proto.listen(), query.listen()]);
    isBooting = false;
    log.info("We're ready to roll boss!");
  } catch (err) {
    // Should also use the error lib to check if this is a critical/terminal error.
    if (isBooting) {
      log.error("An error occurred while booting!", err);
      log.warn("The server will now stop.");
      await stop();
    } else {
      // I want to see if this can recover.
      log.error("An error occurred in Spile! Please report this to the developers.", err);
    }
  }
}

export async function stop() {
  try {
    log.warn("Stopping server.");
    await Promise.all([rcon.close(), proto.close(), query.close()]);
    log.info("Thanks for playing!");
    log.destroySyncUnsafe();

    // eslint-disable-next-line no-process-exit
    process.exit();
  } catch (err) {
    // Don't use the logger, as an error as severe as this could be caused by the logger itself!
    // eslint-disable-next-line no-console
    console.error(
      "An error occurred while stopping the server!",
      "Please report this! The server will now close dirtily.\n",
      err,
    );

    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}
