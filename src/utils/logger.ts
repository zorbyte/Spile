import {
  gray,
  cyan,
  yellow,
  red,
  green,
  magenta,
  bold,
} from "std/fmt/colors.ts";

const METHOD_COLOURS = {
  debug: gray,
  info: cyan,
  warn: yellow,
  error: red,
};

type LevelNames = keyof typeof METHOD_COLOURS;
type LoggerMethods = Record<LevelNames, typeof console.log>;

export interface Logger extends LoggerMethods {
  child(...names: string[]): Logger;
}

let defaultName = "";

export function setDefaultName(newDefaultName: string) {
  defaultName = newDefaultName;
}

// Add these overloads so that the child creation function isn't usually visible.
export function createLogger(name?: string): Logger;
export function createLogger(name: string, childNames: string[]): Logger;
export function createLogger(name = defaultName, childNames?: string[]) {
  const knownChildNames = childNames ?? [];

  // If a logger has a blank name and has children,
  // take the first child name as the main name.
  if (name === "" && knownChildNames.length) name = knownChildNames.pop() ?? "";
  const debugEnabled = Deno.env.get("DEBUG_LOG") === "true";
  const displayName = [name, ...knownChildNames]
    .filter((name) => name !== "")
    .map(green).join(gray(" > "));

  const loggerObj: Logger = {
    debug(...args: unknown[]) {
      if (!debugEnabled) return;
      writeLog(displayName, "debug", ...args);
    },
    info: writeLog.bind(null, displayName, "info"),
    warn: writeLog.bind(null, displayName, "warn"),
    error: writeLog.bind(null, displayName, "error"),
    child(...childNames: string[]) {
      return createLogger(name, [...knownChildNames, ...childNames]);
    },
  };

  return loggerObj;
}

function writeLog(
  displayName: string,
  key: LevelNames,
  ...args: unknown[]
) {
  const callableKey = key === "warn" ? "info" : key;
  const colouriser = METHOD_COLOURS[key];

  console[callableKey as "log"](
    formatLog(displayName, { method: key, colouriser }),
    ...args,
  );
}

function formatLog(
  displayName: string,
  opts: { method: string; colouriser: typeof gray },
) {
  // 11 is the length of the ANSI escape codes.
  if (displayName.length > 11) displayName += " ";
  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString();
  return `${
    bold(
      // Sliced so that we only get the time without the date.
      magenta(timeStr.slice(0, timeStr.indexOf(" "))),
    )
  } ${displayName}${opts.colouriser(opts.method)}`;
}
