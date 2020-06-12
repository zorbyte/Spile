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
  if (name === "" && knownChildNames.length) name = knownChildNames.pop() ?? "";
  const debugEnabled = !!Deno.env.get("DEBUG_LOG");
  const displayName = [name, ...knownChildNames].map(green).join(gray(" > "));

  const loggerObj = (Object.fromEntries(
    Object.entries(METHOD_COLOURS).map(([key, colouriser]) => [
      key,
      (...args: unknown[]) => {
        const callableKey = key === "warn" ? "info" : key;
        if (callableKey === "debug" && !debugEnabled) return;
        console[callableKey as "log"](
          formatLog(displayName, { method: key, colouriser }),
          ...args,
        );
      },
    ]),
  ) as unknown) as Logger;

  loggerObj.child = (...childNames: string[]) =>
    createLogger(name, [...childNames, ...knownChildNames]);

  return loggerObj;
}

export function createChild(...childNames: string[]) {
  return createLogger(defaultName, childNames);
}

function formatLog(
  displayName: string,
  opts: { method: string; colouriser: typeof gray },
) {
  if (displayName.length > 11) displayName += " ";
  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString();
  return `${
    bold(
      magenta(timeStr.slice(0, timeStr.indexOf(" "))),
    )
  } ${displayName}${opts.colouriser(opts.method)}`;
}
