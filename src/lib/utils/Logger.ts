import { formatWithOptions } from "util";

import Packet from "@net/protocol/Packet";

import chalk from "chalk";
import SonicBoom from "sonic-boom";

import { streamSupportsColour } from "./utils";

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

const METHOD_COLOURS: MethodColours = {
  debug: chalk.grey,
  info: chalk.cyan,
  warn: chalk.yellow,
  error: chalk.red,
};

class Logger {
  public static stdout?: SonicBoom;
  private static destroyed = false;
  private static stdoutColours = streamSupportsColour(process.stdout);

  public static destroySync(): void {
    try {
      Logger.destroyed = true;
      Logger.stdout.flushSync();
    } finally {
      Logger.stdout.destroy();
    }
  }

  private name?: string;
  private levelMin: LoggerLevels;

  // Although it is unlikely we will not supply a name, we should allow this to enable modularity.
  public constructor(name?: string, levelMin?: LoggerLevels, fd?: string | number, childName?: string);
  public constructor(
    name?: string | LoggerLevels,
    levelMin: string | LoggerLevels = LoggerLevels.INFO,
    private fd?: string | number,
    childName?: string,
  ) {
    // TODO: Refactor this cancer.
    const nameType = typeof name;

    if (nameType === "undefined" && typeof levelMin === "undefined") levelMin = LoggerLevels.INFO;
    if (name in LoggerLevels) levelMin = name;
    else if (nameType === "string") name = chalk.green((name as string).toLowerCase());

    if (name && childName) name += ` ${chalk.gray(">")} ${chalk.green(childName.toLowerCase())}`;

    this.name = name as string | undefined;
    this.levelMin = levelMin as LoggerLevels;
    this.fd = fd || (process.stdout as unknown as { fd: number }).fd;

    if (!Logger.stdout) Logger.stdout = new SonicBoom({ fd: this.fd } as any);

    let i = 0;
    for (const [lvl, colFn] of Object.entries(METHOD_COLOURS)) {
      const levelIndex = i;
      this[lvl as keyof LoggerMethods] = (...args: any[]): void => {
        if (levelIndex >= levelMin) {
          // eslint-disable-next-line no-console
          if (Logger.destroyed) return console.log(`[DESTROYED LOGGER]: ${lvl}`, ...args);

          let logStr = formatWithOptions(
            { colors: Logger.stdoutColours },
            this.formatString(lvl, colFn),
            ...args,
          );

          logStr += "\n";

          Logger.stdout.write(logStr);
        }
      };

      i++;
    }
  }

  public child(name: string): Logger {
    return new Logger(this.name, this.levelMin, this.fd, name);
  }

  public logPacket(msg: string, packet: Packet) {
    this.twoPieceLog("debug", msg, packet);
  }

  public quickError(msg: string, err: Error) {
    this.twoPieceLog("error", msg, err);
  }

  public twoPieceLog(method: keyof LoggerMethods, msg: string, data: unknown) {
    // TODO: Detect if the level is disabled and return, in order to optimise prod.
    this[method](`${msg}\n${formatWithOptions(
      { colors: Logger.stdoutColours },
      data as string,
    )}`);
  }

  private formatString(levelName: keyof MethodColours, colourMethod: chalk.Chalk): string {
    const currentTime = new Date();
    return `${chalk.bold.magenta(currentTime.toLocaleTimeString("en-GB"))}${this.name ? ` ${this.name}` : ""} ${colourMethod(levelName)}`;
  }
}

export default Logger;
