type TCacheItem = number | string;
type TCacheMap = Record<string, TCacheItem>;

interface IDestructurable {
  dev: boolean;
  debug: boolean;
}

class Environment {
  private static cacheMap: TCacheMap = {}

  public static get(): IDestructurable {
    return {
      dev: this.dev,
      debug: this.debug,
    };
  }

  public static get dev(): boolean {
    return this.devSig === 0;
  }

  public static get debug(): boolean {
    return this.debugSig === 0;
  }

  public static get debugSig(): number {
    const debugSig = () => parseInt(process.env.NETHERITE_DEBUG ?? "2") - 1;
    return this.getOrSetCache("debugSig", debugSig);
  }

  public static get devSig(): number {
    const devSig = () => parseInt(process.env.DEVELOPMENT ?? "2") - 1;
    return this.getOrSetCache("devSig", devSig);
  }

  private static getOrSetCache<T extends TCacheItem>(id: keyof TCacheMap, valueGetter: () => T): T {
    if (id in this.cacheMap) return this.cacheMap[id] as T;
    const result = valueGetter();
    this.cacheMap[id] = result;
    return result;
  }
}

export default Environment;
