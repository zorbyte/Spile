import { constants, PathLike, promises } from "fs";

import Environment from "./Environment";

export function getLoggerLevel(): number {
  return Math.min(Environment.debugSig, Environment.devSig, 1);
}

// This is a replica of Java's Object.hashCode() method.
export function createJavaHash(strToHash: string): number {
  let hash = 0;
  let char: number;
  for (const charStr of strToHash) {
    char = charStr.charCodeAt(0);
    hash = hash * 31 + char;

    // Convert to 32bit integer.
    hash |= 0;
  }

  return hash;
}

export async function fileExists(fileName: PathLike): Promise<boolean> {
  try {
    await promises.access(fileName, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function dependencyPresent(dependencyName: string): Promise<boolean> {
  try {
    await import(dependencyName);
    return true;
  } catch {
    return false;
  }
}

export default createJavaHash;
