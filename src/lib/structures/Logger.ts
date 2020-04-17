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
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https: //www.gnu.org/licenses/>.
 */

import { isMaster } from "cluster";
import { createInterface, Interface } from "readline";
import { WriteStream } from "tty";
import { formatWithOptions } from "util";

import Environment from "@structs/Environment";

import chalk from "chalk";
import ora from "ora";
import SonicBoom from "sonic-boom";

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

/**
 * @class {Logger}
 */
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
   * The Readline instance used for the server input prompt.
   */
  private static rl?: Interface;

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

  /**
   * The current ora instance.
   */
  private currentOra?: ora.Ora;

  // 1 should only be used in production! Use 0 in development.
  // These still work as numbers, but I recommend you use the enum.
  // @todo Make this an overload when the linter supports it!
  public constructor(
    name?: string | LoggerLevels,
    levelMin: string | LoggerLevels = LoggerLevels.INFO,
    private isChild = false,
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
      if (childName) name += ` ${chalk.gray(">")} ${chalk.dim(childName)}`;
      Logger.registeredNames.push(name as string);
    }

    this.name = name as string | undefined;
    this.levelMin = levelMin as LoggerLevels;

    let i = 0;

    this.fd = fd || (process.stdout as unknown as { fd: number; }).fd;

    if (!Logger.stdout) Logger.stdout = new SonicBoom({ fd: this.fd } as any);

    const stdoutColours = this.checkColourSupport(process.stdout);
    Logger.stdout.on("drain", () => {
      if (Logger.rl) Logger.rl.prompt(true);
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
    return new Logger(this.name, this.levelMin, true, this.fd, name);
  }

  public startRL(): void {
    try {
      this.coreLoggerCheckRL("create");
      Logger.rl = createInterface({
        input: process.stdin,
        output: process.stderr,
        prompt: `${chalk.blue(">")} `,
        crlfDelay: Infinity,
      });

      Logger.rl.prompt();

      Logger.rl.on("line", line => this.debug("Line sent to Readline:", line));
    } catch (err) {
      this.error("An error occurred while creating the Readline instance!", err);
    }
  }

  public closeRL(): void {
    try {
      this.coreLoggerCheckRL("close");
      Logger.rl?.close();
      Logger.rl = void 0;
    } catch (err) {
      this.error("An error occurred while closing the Readline instance!", err);
    }
  }

  public start(text?: string): void {
    if (this.currentOra) this.stopSpinner();
    this.currentOra = ora({ text, spinner: "dots" }).start();
  }

  public update(text: string): void {
    if (this.currentOra) this.currentOra.text = text;
  }

  public stopSpinner(): void {
    this.currentOra?.stop();
    this.currentOra = void 0;
  }

  public get stop(): Logger {
    this.stopSpinner();
    return this;
  }

  public close(): void {
    Logger.stdout.end();
  }

  public emergencyDestroy(): void {
    try {
      Logger.stdout.flushSync();
    } finally {
      Logger.stdout.destroy();
    }
  }

  private coreLoggerCheckRL(action: "create" | "close"): void {
    if (!isMaster) throw new Error(`A non-master process can not ${action} a Readline instance!`);
    if (this.isChild) throw new Error(`Child loggers can not ${action} Readline instances!`);
    if (action === "create" && Logger.rl) throw new Error("Can not create a new Readline instance when one already exists!");
  }

  private formatString(levelName: keyof MethodColours, colourMethod: chalk.Chalk): string {
    const currentTime = new Date();
    return `${chalk.bold.magenta(currentTime.toLocaleTimeString("en-GB"))}${this.name ? ` ${chalk.green(this.name)}` : ""} ${colourMethod(levelName)}`;
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
