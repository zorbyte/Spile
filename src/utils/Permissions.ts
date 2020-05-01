class Permissions<T extends (string | number), TEnumValue extends number, E = { [key in T]: TEnumValue }> {
  private rawPerms: (0 | 1)[];
  private acceptedLength: number;

  public constructor(private permEnum: E) {
    // Divide by two, since TS enums also use numbers to access the props too.
    this.acceptedLength = Reflect.ownKeys(permEnum as unknown as object).length / 2;
    this.rawPerms = Array(this.acceptedLength).fill(0);
  }

  public add(perm: TEnumValue): void {
    this.rawPerms[this.getIndex(perm)] = 1;
  }

  public remove(perm: TEnumValue): void {
    this.rawPerms[this.getIndex(perm)] = 0;
  }

  public raw(): number {
    return parseInt(this.rawPerms.join(""), 2);
  }

  private getIndex(perm: TEnumValue): number {
    return this.rawPerms
      .findIndex((_, i) => {
        const ind = i > this.acceptedLength - 1 ? i - this.acceptedLength : i;
        return (this.permEnum as unknown as Record<T, TEnumValue>)[ind as unknown as T] === perm;
      });
  }
}

export default Permissions;
