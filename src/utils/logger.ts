import {
  gray,
  cyan,
  yellow,
  red,
  green,
  magenta,
  bold,
} from "https://deno.land/std/fmt/colors.ts";

const METHOD_COLOURS = {
  debug: gray,
  info: cyan,
  warn: yellow,
  error: red,
};

type LevelNames = keyof typeof METHOD_COLOURS;
type LoggerMethods = Record<LevelNames, typeof console.log>;

interface Logger extends LoggerMethods {
  child: Logger;
}

export function createLogger(name: string): Logger;
export function createLogger(name: string, childNames?: string[]) {
  const debugEnabled = !!Deno.env.get("DEBUG");
  const displayName = [name, ...(childNames ?? [])].map(green).join(gray(" >"));

  const loggerObj = Object.fromEntries(
    Object.entries(METHOD_COLOURS).map(([key, coloriser]) => [
      key,
      (...args: unknown[]) => {
        let callableKey = key === "warn" ? "info" : key;
        if (callableKey === "debug" && !debugEnabled) return;
        console[callableKey as "log"](
          formatLog(displayName, { method: key, coloriser }),
          ...args,
        );
      },
    ]),
  );

  return (loggerObj as unknown) as Logger;
}

function formatLog(
  displayName: string,
  opts: { method: string; coloriser: typeof gray },
) {
  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString();
  return `${
    bold(
      magenta(timeStr.slice(0, timeStr.indexOf(" "))),
    )
  } ${displayName} ${opts.coloriser(opts.method)}`;
}
