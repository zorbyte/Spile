import chalk from "chalk";
import SonicBoom from "sonic-boom";
import ora from "ora";
import { formatWithOptions } from "util";
import { WriteStream } from "tty";
import { createInterface, Interface } from "readline";
import Environment from "../../modules/Environment";

interface IMethodColours {
  [k: string]: chalk.Chalk;
}

interface IConsoleLogMethods {
  debug(...any: any[]): void;
  info(...any: any[]): void;
  warn(...any: any[]): void;
  error(...any: any[]): void;
}

// Used for type checking on class building.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ILoggerMethods extends IConsoleLogMethods { }

// Used to superimpose methods over the Logger class.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Logger extends ILoggerMethods { }

export enum ELoggerLevels {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

interface IColourOption {
  colors?: boolean;
}

export function calculateLevel(env: typeof Environment): number {
  return Math.min(env.debugSig, env.devSig, 1);
}

class Logger {
  public static stdout?: SonicBoom;
  private static rl?: Interface;

  public methodColours: IMethodColours = {
    debug: chalk.grey,
    info: chalk.cyan,
    warn: chalk.yellow,
    error: chalk.red,
  };

  private currentOra: ora.Ora | null = null;

  // 1 should only be used in production! Use 0 in development.
  // These still work as numbers, but I recommend you use the enum.
  public constructor(public name?: string | ELoggerLevels, levelMin: string | ELoggerLevels = ELoggerLevels.INFO, fd?: string) {
    /* eslint-disable no-param-reassign */
    const nameType = typeof this.name;
    if (nameType === "undefined" && typeof levelMin === "undefined") levelMin = ELoggerLevels.INFO;
    if (this.name in ELoggerLevels) levelMin = this.name;
    // @ts-ignore
    else if (nameType === "string") this.name = this.name.toLowerCase();
    /* eslint-enable no-param-reassign */

    let i = 0;

    if (!Logger.stdout) {
      Logger.stdout = new SonicBoom({ fd: fd || (process.stdout as unknown as { fd: number; }).fd } as unknown as string);
    }

    const stdoutColours = this.checkColourSupport(process.stdout);
    Logger.stdout.on("drain", () => {
      if (Logger.rl) {
        Logger.rl.prompt(true);
      }
    });

    for (const [lvl, colFn] of Object.entries(this.methodColours)) {
      const levelIndex = i;

      this[lvl as keyof ILoggerMethods] = (...args: any[]) => {
        if (levelIndex >= levelMin) {
          let logStr = formatWithOptions(
            stdoutColours,
            this.formatString(lvl, colFn),
            ...args,
          );

          logStr = `\r${logStr}\n`;

          Logger.stdout.write(logStr);
        }
      };

      i++;
    }
  }

  public startREPL() {
    Logger.rl = createInterface({
      input: process.stdin,
      output: process.stderr,
      prompt: `${chalk.blue(">")} `,
      crlfDelay: Infinity,
    });

    Logger.rl.prompt();

    Logger.rl.on("line", line => this.debug("Line sent to Readline:", line));
  }

  public start(text?: string): void {
    if (this.currentOra) this.stopSpinner();
    this.currentOra = ora({ text, spinner: "dots" }).start();
  }

  public update(text: string): void {
    if (this.currentOra) this.currentOra.text = text;
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

  private formatString(levelName: keyof IMethodColours, colourMethod: chalk.Chalk): string {
    const currentTime = new Date();
    return `${chalk.bold.magenta(currentTime.toLocaleTimeString("en-GB"))}${this.name ? ` ${chalk.green(this.name)}` : ""} ${colourMethod(levelName)}`;
  }

  private checkColourSupport(stream: WriteStream): IColourOption | {} {
    return stream.isTTY && (typeof stream.getColorDepth === "function" ? stream.getColorDepth() > 2 : true) ?
      { colors: true } :
      {};
  }
}

export default Logger;
