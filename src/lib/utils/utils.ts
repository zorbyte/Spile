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

import { constants, PathLike, promises } from "fs";

import Environment from "@utils/Environment";

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
