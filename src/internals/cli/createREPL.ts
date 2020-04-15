import { REPLServer, start } from "repl";
import SonicBoom from "sonic-boom";
import Logger from "./Logger";
import { WriteStream } from "tty";
import { Transform } from "stream";
import chalk from "chalk";

// TODO: This needs to be rewritten from scratch.
function createREPL(log: Logger, stdout: SonicBoom): REPLServer {
  let missingDot = false;
  const filteredStream = new Transform({
    transform(chunk: Buffer, _, callback) {
      if (!chunk.toString().startsWith(".")) return callback(null, chunk);
      missingDot = true;
      callback(null, chunk.slice(1));
    },
  });

  process.stdin.pipe(filteredStream);

  const repl = start({
    output: stdout as unknown as WriteStream,
    input: filteredStream,
    prompt: `${chalk.blue(">")} `,
    ignoreUndefined: true,
    terminal: false,
    useColors: true,
    useGlobal: false,
    eval: (cmdStr, _, __, cb) => {
      if (/^\r?\n|\r$/g.test(cmdStr)) return cb(null, void 0);
      let cmd = cmdStr.replace(/\r?\n|\r/, "");
      if (missingDot) {
        cmd = `.${cmd}`;
        missingDot = false;
      }

      repl.clearBufferedCommand();
      if (cmd === "help") {
        stdout.write(`\r---- Help ----\n/${chalk.yellow("nou")} - No command information available.\n`);
        repl.displayPrompt();
      } else if (cmd === "stop") {
        log.warn("Stopping server!");
        repl.displayPrompt();
        repl.close();
        log.start("Cleaning up.");
        setTimeout(() => {
          log.stop.debug("Goodbye!");
          process.exit(0);
        }, 1000);
        return;
      } else {
        log.info("Input sent to REPL:", cmd);
      }
    },
  });

  return repl;
}

export default createREPL;
