import Command from "@marshal/Command";
import { CommandContext } from "@marshal/CommandContext";
import { initPacketCodec } from "@net/protocol/packetCodec";
import ProtoServer from "@net/protocol/ProtoServer";
import Logger from "@utils/Logger";
import Stopwatch from "@utils/Stopwatch";
import { getPackageJson } from "@utils/utils";

import { GITHUB_URL } from "./constants";
import { mainLog as log } from "./mainLog";

export const commands = new Map<string, Command<CommandContext>>();

let isBooting = true;

let proto: ProtoServer;

export async function bootstrap(stopwatch: Stopwatch) {
  try {
    const { version } = await getPackageJson();
    log.info(`Welcome to Spile version v${version} written by zorbyte`);
    log.info(`Please consider starring this project on Github at ${GITHUB_URL}`);

    proto = new ProtoServer();

    await initPacketCodec()
      .catch(err => {
        // Specify that this is the packet codec that just failed.
        // TODO: Move this to a catch statement in the packet codec and insert this into the Promise.all.
        log.error("Failed to initialise packet codec");
        throw err;
      });

    await proto.listen();

    isBooting = false;
    stopwatch.stop();
    log.info(`Bootstrap finished in ${stopwatch.toString()}`);

  } catch (err) {
    // Should also use the error lib to check if this is a critical/terminal error.
    if (isBooting) {
      log.quickError("An error occurred while booting", err);
      await stop();
    } else {
      // I want to see if this can recover.
      log.quickError("An error occurred in Spile! Please report this to the developers", err);
    }
  }
}

export async function stop(): Promise<never> {
  try {
    log.warn("Stopping Spile");
    await proto.close();

    Logger.destroySync();
    log.debug("Ready to exit");

    // eslint-disable-next-line no-process-exit
    process.exit();
  } catch (err) {
    // Don't use the logger, as an error as severe as this could be caused by the logger itself!
    // eslint-disable-next-line no-console
    console.error(
      "An error occurred while stopping the server!",
      "Please report this error! The server will now close dirtily\n",
      err,
    );
  } finally {
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}
