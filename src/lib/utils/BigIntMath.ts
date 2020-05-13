// All credit to the Author of this article: https://golb.hplar.ch/2018/09/javascript-bigint.html
// I straight up ripped this from there.

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class BigIntMath {
  public static max(...values: bigint[]) {
    if (values.length === 0) return;
    if (values.length === 1) return values[0];

    let [max] = values;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > max) max = values[i];
    }

    return max;
  }

  public static min(...values: bigint[]) {
    if (values.length === 0) return;
    if (values.length === 1) return values[0];

    let [min] = values;
    for (let i = 1; i < values.length; i++) {
      if (values[i] < min) min = values[i];
    }

    return min;
  }

  public static sign(value: bigint) {
    if (value > 0n) return 1n;
    if (value < 0n) return -1n;
    return 0n;
  }

  public static abs(value: bigint) {
    if (this.sign(value) === -1n) return -value;
  }

  public static sqrt(value: bigint) {
    if (value < 0n) throw new EvalError("Non-positive numbers can not be square rooted!");

    if (value < 2n) return value;

    function newtonIteration(n: bigint, x0: bigint): bigint {
      const x1 = ((n / x0) + x0) >> 1n;
      if (x0 === x1 || x0 === (x1 - 1n)) return x0;
      return newtonIteration(n, x1);
    }

    return newtonIteration(value, 1n);
  }
}

export default BigIntMath;
