import {
  extname,
  join,
  relative,
  sep,
} from "path";

import { STypeError } from "@lib/errors";
import { mainLog } from "@lib/mainLog";
import { commands } from "@lib/mediator";

import { scan } from "fs-nextra";

import CommandBuilder from "./CommandBuilder";
import { CommandContext } from "./CommandContext";

const log = mainLog.child("marshal");

const CMD_DIR = join(__dirname, "commands");

export async function initMarshal() {
  log.debug("Initialising the Marshal command library.");
  log.debug("Querying commands directory...");
  const files = await scan(CMD_DIR, {
    filter: (stats, path) => stats.isFile() && extname(path) === ".js",
  });

  log.debug("Registering commands...");
  await Promise.all([...files.keys()]
    .map(async loc => {
      const cmdName = relative(CMD_DIR, loc).slice(0, -3);

      // Commands prefixed with "_" are ignored.
      if (cmdName.startsWith("_")) return;

      const fileObj = await import(loc);

      if (!fileObj.default) return log.warn(`The command ${cmdName} has no default export!`);
      const cmd = fileObj.default as CommandBuilder<CommandContext>;

      if (!(cmd instanceof CommandBuilder)) return log.error(new STypeError("INVALID_COMMAND_BUILDER", cmdName));

      const category = cmdName.split(sep)[0];

      commands.set(cmdName, cmd.compile(category));
      log.debug(`Registered command ${cmdName}.`);
    }));

  log.info("Registered all commands!");
}
