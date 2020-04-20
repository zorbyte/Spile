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

type CacheItem = number | string;
type CacheMap = Record<string, CacheItem>;

interface Destructurable {
  dev: boolean;
  debug: boolean;
  normal: boolean;
}

class Environment {
  private static cacheMap: CacheMap = {};
  private static envLoaded = false;

  public static async load(): Promise<void> {
    if (!Environment.envLoaded) {
      const dotenv = await import("dotenv");
      dotenv.config();
    }
  }

  public static get(): Destructurable {
    return {
      dev: this.dev,
      debug: this.debug,
      normal: this.normal,
    };
  }

  public static get normal(): boolean {
    return !this.dev && !this.debug;
  }

  public static get dev(): boolean {
    return this.devSig === 0;
  }

  public static get debug(): boolean {
    return this.debugSig === 0;
  }

  public static get debugSig(): number {
    const debugSig = (): number => parseInt(process.env.S_DEBUG ?? "2") - 1;
    return this.getOrSetCache("debugSig", debugSig);
  }

  public static get devSig(): number {
    const devSig = (): number => parseInt(process.env.DEVELOPMENT ?? "2") - 1;
    return this.getOrSetCache("devSig", devSig);
  }

  private static getOrSetCache<T extends CacheItem>(id: keyof CacheMap, valueGetter: () => T): T {
    if (id in this.cacheMap) return this.cacheMap[id] as T;
    const result = valueGetter();
    this.cacheMap[id] = result;
    return result;
  }
}

export default Environment;
