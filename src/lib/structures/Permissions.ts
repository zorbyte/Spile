/**
 * Spile Minecraft Server
 * @author zorbyte <zorbytee@gmail.com>
 *
 * @license
 * Copyright (C) 2020 The Spile Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https: //www.gnu.org/licenses/>.
 */

class Permissions<T extends (string | number), TEnumValue extends number, E = { [key in T]: TEnumValue }> {
  private rawPerms: Array<0 | 1>;
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
