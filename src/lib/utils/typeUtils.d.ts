// TODO: Fix these types to align with the new Proxy based server stuff.

export type Predicate<T extends any[]> = (...args: T) => boolean;
export type $TSFix = any;
export type Asyncable<T> = Promise<T> | T;
