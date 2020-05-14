// All credit goes to the authors of https://github.com/dirigeants/stopwatch/blob/impl/src/index.ts
// Waiting until the module goes public as @klasa/stopwatch on npm, until then, just have it here.
// Copyright (c) 2017-2019 dirigeants - MIT.

import { performance } from "perf_hooks";

/**
 * Klasa's Stopwatch class, uses native node to replicate/extend performance now dependency.
 */
class Stopwatch {
  /**
	 * The number of digits to appear after the decimal point when returning the friendly duration.
	 */
  public digits: number;

  /**
	 * The start time of this stopwatch
	 */
  private _start: number;

  /**
	 * The end time of this stopwatch
	 */
  private _end: number | null;

  /**
	 * Starts a new stopwatch
	 */
  public constructor(digits = 2) {
    this.digits = digits;
    this._start = performance.now();
    this._end = null;
  }

  /**
	 * The duration of this stopwatch since start or start to end if this stopwatch has stopped.
	 */
  public get duration(): number {
    return this._end ? this._end - this._start : performance.now() - this._start;
  }

  /**
	 * If the stopwatch is running or not.
	 */
  public get running(): boolean {
    return Boolean(!this._end);
  }

  /**
	 * Restarts the stopwatch (Returns a running state)
	 */
  public restart(): this {
    this._start = performance.now();
    this._end = null;
    return this;
  }

  /**
	 * Resets the Stopwatch to 0 duration (Returns a stopped state)
	 */
  public reset(): this {
    this._start = performance.now();
    this._end = this._start;
    return this;
  }

  /**
	 * Starts the Stopwatch
	 */
  public start(): this {
    if (!this.running) {
      this._start = performance.now() - this.duration;
      this._end = null;
    }

    return this;
  }

  /**
	 * Stops the Stopwatch, freezing the duration
	 */
  public stop(): this {
    if (this.running) this._end = performance.now();
    return this;
  }

  /**
	 * Defines toString behavior
	 */
  public toString(): string {
    const time = this.duration;
    if (time >= 1000) return `${(time / 1000).toFixed(this.digits)}s`;
    if (time >= 1) return `${time.toFixed(this.digits)}ms`;
    return `${(time * 1000).toFixed(this.digits)}μs`;
  }
}

export default Stopwatch;
