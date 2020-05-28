import {
  ERROR_MESSAGES,
  ErrorMessages,
} from "./messages.ts";
import { AnyFunction } from "../utils/type_utils.d.ts";

type ErrorArgs<K extends keyof ErrorMessages> = Parameters<
  ErrorMessages[K] extends AnyFunction<string> ? ErrorMessages[K]
    : AnyFunction<string>
>;
type Constructor<T extends object> = new (
  ...args: ErrorArgs<keyof ErrorMessages>
) => T;
type SpileErrorCtor = new (
  key: keyof ErrorMessages,
  ...args: ErrorArgs<typeof key>
) => Error;

export const kSpileError = Symbol.for("kSpileError");
const ERROR_PROPS = Object.keys(Error.prototype);

/**
 * Heavily inspired from GAwesomeBot's and Discord.js's Error code,
 * which in turn is inspired from Node's `internal/errors` module.
 */
function createCustomError<E extends SpileErrorCtor>(DummyBaseCtor: E) {
  // Ideally this cast would not be required
  // For now it solves the "Type 'E' is not a constructor function type" error.
  const BaseCtor: Constructor<Error> = DummyBaseCtor;

  return class SpileError<K extends keyof ErrorMessages> extends BaseCtor {
    public readonly [kSpileError]: boolean;

    public constructor(
      public readonly key: K,
      ...args: ErrorArgs<K>
    ) {
      // Error thrown further down the stack if need be.
      super(message(key, args));

      Object.defineProperty(this, kSpileError, {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      // TODO: Find out if this is required.
      // if (Error.captureStackTrace) Error.captureStackTrace(this, SpileError);
    }

    public get name() {
      return `${super.name} [${this.key}]`;
    }

    public get code() {
      return this.key;
    }
  };
}

export const SError = createCustomError(Error);
export const STypeError = createCustomError(TypeError);
export const SRangeError = createCustomError(RangeError);

export function isError(
  error: Record<string, any> | InstanceType<SpileErrorCtor>,
  errSymbol = kSpileError,
) {
  return error &&
      [...ERROR_PROPS, errSymbol].every((propName) =>
        error.hasOwnProperty(propName)
      ) ||
    error instanceof Error;
}

function message<K extends keyof ErrorMessages>(
  key: K,
  args: ErrorArgs<K>,
) {
  if (typeof key !== "string") {
    throw new TypeError("Error message key is not a string");
  }

  if (!(key in ERROR_MESSAGES)) throw new SError("INVALID_ERROR_KEY", key);
  const msg = ERROR_MESSAGES[key];

  if (typeof msg === "function") {
    return (msg as AnyFunction<string>)(...args);
  }

  if (args === undefined || args.length === 0) return msg;
  args.unshift(msg as string);

  return String(...args);
}
