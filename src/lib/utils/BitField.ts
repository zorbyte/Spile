class BitField<T extends (string | number), TEnumValue extends number, E = { [key in T]: TEnumValue }> {
  private rawValues: (0 | 1)[];
  private acceptedLength: number;

  public constructor(private fieldEnum: E) {
    // Divide by two, since TS enums also use numbers to access the props too.
    this.acceptedLength = Reflect.ownKeys(fieldEnum as unknown as object).length / 2;
    this.rawValues = Array(this.acceptedLength).fill(0);
  }

  public add(field: TEnumValue): void {
    this.rawValues[this.getIndex(field)] = 1;
  }

  public remove(field: TEnumValue): void {
    this.rawValues[this.getIndex(field)] = 0;
  }

  public raw(): number {
    return parseInt(this.rawValues.join(""), 2);
  }

  private getIndex(perm: TEnumValue): number {
    return this.rawValues
      .findIndex((_, i) => {
        const ind = i > this.acceptedLength - 1 ? i - this.acceptedLength : i;
        return (this.fieldEnum as unknown as Record<T, TEnumValue>)[ind as unknown as T] === perm;
      });
  }
}

export default BitField;
