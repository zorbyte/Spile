// @link https://github.com/skyra-project/skyra/blob/ac8d0f42270cb45fd1f2e9869fd3d7176c021d8e/src/lib/util/util.ts#L596
// @license MIT - Copyright Skyra Developers.
export function Enumerable(value: boolean) {
  return (target: unknown, key: string | symbol) => {
    Object.defineProperty(target, key, {
      enumerable: value,
      set(this: unknown, val: unknown) {
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: value,
          value: val,
          writable: true,
        });
      },
    });
  };
}

// Improves speed when working with heavily concatenated strings.
// It works by flattening the underlying C structures of a string.
export function flatStr(str: string): string {
  // @ts-ignore
  return str | 0;
}
