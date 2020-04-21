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

interface InternalField<P> {
  key: keyof P;
  type: DataType<any>;
}

type DeserialiseRet<T> = T | Progress<T>;

export interface Field<P> extends InternalField<P> {
  key: Exclude<keyof P, "length" | "compressedLength" | "id">;
}

export interface Progress<T> {
  accumulated: T;
  meta: any;
}

export interface DataType<T> {
  serialise: (data: T) => Uint8Array | Promise<Uint8Array>;
  deserialise: (raw: Uint8Array, progress?: Progress<T>) => DeserialiseRet<T> | Promise<DeserialiseRet<T>>;
}

export enum Destination {
  CLIENT_BOUND,
  SERVER_BOUND,
  DUPLEX_BOUND,
}

const test: DataType<number> = {
  serialise(_data) { return new Uint8Array(); },
  deserialise(_raw) { return 1; },
};

abstract class PacketCodec<P extends PacketCodec<P>> {
  public length: number;
  public compressedLength?: number;
  public id: number;

  public constructor(private fields: Field<P>[]) {
    (this.fields as InternalField<P>[]).unshift(
      { key: "length", type: test },
      { key: "compressedLength", type: test },
      { key: "id", type: test },
    );
  }
}

export default PacketCodec;
