import { WriteStream } from "tty";
import { formatWithOptions } from "util";

import Environment from "@utils/Environment";
import EventBus from "@utils/EventBus";

import chalk from "chalk";
import SonicBoom from "sonic-boom";

interface MethodColours {
  [k: string]: chalk.Chalk;
}

interface ConsoleLogMethods {
  debug: (...any: any[]) => void;
  info: (...any: any[]) => void;
  warn: (...any: any[]) => void;
  error: (...any: any[]) => void;
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
  /**
   * The sonicboom stream, much faster than using process.stdout.
   */
  public static stdout?: SonicBoom;

  /**
   * All the logger names in use in this runtime.
   */
  private static registeredNames: string[] = [];

  /**
   * The colours used for the log levels.
   */
  private methodColours: MethodColours = {
    debug: chalk.grey,
    info: chalk.cyan,
    warn: chalk.yellow,
    error: chalk.red,
  };

  /**
   * The name of the current instance, including colour codes.
   */
  private name?: string;

  /**
   * The minimum level to be logged.
   */
  private levelMin: LoggerLevels;

  // 1 should only be used in production! Use 0 in development.
  // These still work as numbers, but I recommend you use the enum.
  // Todo: Make this an overload when the linter supports it!
  public constructor(
    name?: string | LoggerLevels,
    levelMin: string | LoggerLevels = LoggerLevels.INFO,
    private fd?: string | number,
    childName?: string,
  ) {
    const nameType = typeof name;
    if (nameType === "undefined" && typeof levelMin === "undefined") levelMin = LoggerLevels.INFO;
    if (name in LoggerLevels) levelMin = name;
    else if (nameType === "string") name = chalk.green((name as string).toLowerCase());

    if (name) {
      if (Logger.registeredNames.includes(name as string)) {
        this.warn(`Can not register a logger with ambiguous name ${name}. No name will be used.`);
        name = void 0;
      }
      if (childName) name += ` ${chalk.gray(">")} ${chalk.green(childName.toLowerCase())}`;
      Logger.registeredNames.push(name as string);
    }

    this.name = name as string | undefined;
    this.levelMin = levelMin as LoggerLevels;

    let i = 0;

    this.fd = fd || (process.stdout as unknown as { fd: number; }).fd;

    if (!Logger.stdout) {
      Logger.stdout = new SonicBoom({ fd: this.fd } as any);
      EventBus.on("rawLog", (data: string) => {
        Logger.stdout.write(`\r${data}\n`);
      });
    }

    const stdoutColours = this.checkColourSupport(process.stdout);
    Logger.stdout.on("drain", async () => {
      await EventBus.send("refreshPrompt");
    });

    for (const [lvl, colFn] of Object.entries(this.methodColours)) {
      const levelIndex = i;

      this[lvl as keyof LoggerMethods] = (...args: any[]): void => {
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

  /**
   * Creates a child logger.
   *
   * @param name The name of the child logger.
   * @returns {Logger}
   */
  public child(name: string): Logger {
    return new Logger(this.name, this.levelMin, this.fd, name);
  }

  public close(): void {
    Logger.stdout.end();
  }

  public finalDestroy(): void {
    try {
      Logger.stdout.flushSync();
    } finally {
      Logger.stdout.destroy();
    }
  }

  private formatString(levelName: keyof MethodColours, colourMethod: chalk.Chalk): string {
    const currentTime = new Date();
    return `${chalk.bold.magenta(currentTime.toLocaleTimeString("en-GB"))}${this.name ? ` ${this.name}` : ""} ${colourMethod(levelName)}`;
  }

  private checkColourSupport(stream: WriteStream): ColourOption | {} {
    return stream.isTTY && (typeof stream.getColorDepth === "function" ? stream.getColorDepth() > 2 : true) ?
      { colors: true } :
      {};
  }
}

export function calculateLevel(env: typeof Environment): number {
  return Math.min(env.debugSig, env.devSig, 1);
}

export default Logger;
