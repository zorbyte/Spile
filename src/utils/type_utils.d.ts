export type ManyArgPredicate<T extends any[]> = (...args: T) => boolean;
export type Predicate<T> = (arg: T) => boolean;
export type Asyncable<T> = Promise<T> | T;

// Use this in place of `any` when you know you can type something but don't have time or are still figuring it out.
export type $TSFix = any;

export type AnyFunction<R = any> = (...args: any[]) => R;

// https://stackoverflow.com/questions/56431150/exclude-object-keys-by-their-value-type-in-typescript
type PickByValue<Base, Condition> = Pick<
  Base,
  {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
  }[keyof Base]
>;
