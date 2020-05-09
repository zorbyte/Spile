import ow from "ow";

import { ERROR_MESSAGES, ErrorMessageKeys } from "./messages";

type Constructor<T extends object> = new (...args: any[]) => T;
type SpileErrorCtor = new (key: ErrorMessageKeys, ...args: string[]) => Error;

// This symbol will be attached to custom errors that were instantiated within spile.
// This works because of how node.js caches modules by the required by module name
// and the absolute path if called internally. The following example explains:
// require("@lib/errors/errorUtils") will return Cache A of the module.
// require("spile/errors/errorUtils") will return Cache B of the module.
// Since this is the only way that an external caller can resolve this module, they will never get the original symbol.
export const kSpileError = Symbol("kSpileError");
const ERROR_PROPS = Object.keys(Error.prototype);

/**
 * Heavily inspired from GAwesomeBot's and Discord.js's Error code,
 * which in turn is inspired from Node's `internal/errors` module.
 */
function createCustomError<E extends SpileErrorCtor>(DummyBaseCtor: E) {
  // Ideally this cast would not be required
  // For now it solves the "Type 'E' is not a constructor function type" error.
  const BaseCtor: Constructor<Error> = DummyBaseCtor;

  return class SpileError extends BaseCtor {
    public readonly [kSpileError] = true;

    public constructor(
      private readonly key: ErrorMessageKeys,
      ...args: string[]
    ) {
      // Error thrown further down the stack if need be.
      super(message(key, args));
      if (Error.captureStackTrace) Error.captureStackTrace(this, SpileError);
    }

    public get name() {
      return `${super.name} [${this.key}]`;
    }

    public get code() {
      return this.key;
    }
  };
}

function message(key: ErrorMessageKeys, args: any[]) {
  ow(key, ow.string);
  if (!(key in ERROR_MESSAGES)) throw new Error(`An invalid error message key was used: ${key}.`);
  const msg = ERROR_MESSAGES[key];

  if (typeof msg === "function") return msg(...args);
  if (args === undefined || args.length === 0) return msg;
  args.unshift(msg);

  return String(...args);
}

export function isError(error: Record<string, any> | InstanceType<SpileErrorCtor>, errSymbol = kSpileError) {
  return error
    && [...ERROR_PROPS, errSymbol].every(propName => error.hasOwnProperty(propName))
    || error instanceof Error;
}

export const SError = createCustomError(Error);
export const STypeError = createCustomError(TypeError);
export const SRangeError = createCustomError(RangeError);
