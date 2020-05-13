// TODO: Fix these types to align with the new Proxy based server stuff.

export type Predicate<T extends any[]> = (...args: T) => boolean;
export type Asyncable<T> = Promise<T> | T;

// Use this in place of any when you know you can type something but don't have time or are still figuring it out.
export type $TSFix = any;

// More of a symbolic type that represents a UUID.
export type UUID = string;
