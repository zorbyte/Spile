import { constants, PathLike, promises } from "fs";
import { constants as zConst, deflate as deflateCb, unzip as unzipCb } from "zlib";

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

export function concatUint8Array(arrays: Uint8Array[]): Uint8Array {
  return arrays
    .reduce((acc, arr) => Uint8Array.from([...acc, ...arr]), [] as unknown as Uint8Array);
}

export function deflate(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    deflateCb(data, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

export function inflate(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    unzipCb(data, { finishFlush: zConst.Z_SYNC_FLUSH }, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

export default createJavaHash;
