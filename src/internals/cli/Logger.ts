import chalk from "chalk";
import SonicBoom from "sonic-boom";
import ora from "ora";
import { formatWithOptions } from "util";
import { WriteStream } from "tty";
import { REPLServer } from "repl";
import createREPL from "./createREPL";

interface MethodColours {
  [k: string]: chalk.Chalk;
}

interface ConsoleLogMethods {
  debug(...any: any[]): void;
  info(...any: any[]): void;
  warn(...any: any[]): void;
  error(...any: any[]): void;
}

// Used for type checking on class building.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LoggerMethods extends ConsoleLogMethods { }

// Used to superimpose methods over the Logger class.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Logger extends LoggerMethods { }

export enum LoggerLevels {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

interface ColourOption {
  colors?: boolean;
}

class Logger {
  public methodColours: MethodColours = {
    debug: chalk.grey,
    info: chalk.cyan,
    warn: chalk.yellow,
    error: chalk.red,
  };

  private stdout: SonicBoom;
  private currentOra: ora.Ora | null = null;
  private repl?: REPLServer;

  // 1 should only be used in production! Use 0 in development.
  // These still work as numbers, but I recommend you use the enum.
  public constructor(levelMin = LoggerLevels.INFO) {
    let i = 0;

    this.stdout = new SonicBoom({ fd: (process.stdout as unknown as { fd: number }).fd } as unknown as string);

    const stdoutColours = this.checkColourSupport(process.stdout);
    const stderrColours = this.checkColourSupport(process.stderr);

    for (const [lvl, colFn] of Object.entries(this.methodColours)) {
      const levelIndex = i;

      this[lvl as keyof LoggerMethods] = (...args: any[]) => {
        if (levelIndex >= levelMin) {
          let logStr = formatWithOptions(
            lvl === "error" ? stderrColours : stdoutColours,
            this.formatString(lvl, colFn),
            ...args,
          );
          logStr += "\n";

          logStr = `\r${logStr}`;
          this.stdout.write(logStr);
          if (this.repl) this.repl.displayPrompt();
        }
      };

      i++;
    }
  }

  public formatString(levelName: keyof MethodColours, colourMethod: chalk.Chalk): string {
    const currentTime = new Date();
    return `${chalk.bold.magenta(currentTime.toLocaleTimeString("en-GB"))} ${colourMethod(levelName)}`;
  }

  public startREPL() {
    this.repl = createREPL(this, this.stdout);
  }

  public start(text?: string): void {
    if (this.currentOra) this.stopSpinner();
    this.currentOra = ora({ text, spinner: "dots" }).start();
  }

  public stopSpinner(): void {
    if (this.currentOra) {
      this.currentOra.stop();
      this.currentOra = null;
    }
  }

  public get stop(): Logger {
    this.stopSpinner();
    return this;
  }

  private checkColourSupport(stream: WriteStream): ColourOption | {} {
    return stream.isTTY && (typeof stream.getColorDepth === "function" ? stream.getColorDepth() > 2 : true) ?
      { colors: true } :
      {};
  }
}

export default Logger;
