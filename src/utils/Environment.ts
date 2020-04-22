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
      Environment.envLoaded = true;
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
    const debugSig = (): number => Math.abs(parseInt(process.env.S_DEBUG ?? "2") - 1);
    return this.getOrSetCache("debugSig", debugSig);
  }

  public static get devSig(): number {
    const devSig = (): number => Math.abs(parseInt(process.env.DEVELOPMENT ?? "2") - 1);
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
