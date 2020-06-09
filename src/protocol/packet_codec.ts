import { STypeError } from "../errors/mod.ts";
import { Predicate } from "../utils/type_utils.d.ts";

import { Consumer } from "./consumer.ts";
import { FieldCodec } from "./field_codec.ts";

// Inbound, Outbound, Bidirectional.
type Direction = "I" | "O" | "B";
type RestrictedKeys = keyof KnownPacketFields;
type FieldCodecType<T> = T extends FieldCodec<infer FType> ? FType : never;
type SkipPredicate<P, T> = (packet: P, data: T) => boolean;

export type PacketType<P> = P extends PacketCodec<infer PType> ? PType : never;

interface FieldInfo<P, T, F = FieldCodec<T>> {
  fieldCodec: F;
  validator?: Predicate<T>;
  skipOn?: SkipPredicate<P, T>;
}

interface KnownPacketFields {
  readonly packetLength: number;
  readonly dataLength: number;
  readonly id: number;
}

class PacketCodec<P extends KnownPacketFields> {
  public name: string;

  private packetFields = new Map<keyof P, FieldInfo<P, any>>();

  public constructor(
    public id: number,
    name: string,
    public direction: Direction,
  ) {
    this.name = name.toLowerCase();
  }

  public addField<
    T extends string,
    F extends FieldCodec<any>,
    FT extends FieldCodecType<F>
  >(key: T & (T extends RestrictedKeys ? never : {}), fieldCodec: F) {
    const fieldInfo: FieldInfo<P, FT> = { fieldCodec };

    this.packetFields.set(key as keyof P, fieldInfo);

    return (this as unknown) as PacketCodec<P & Record<T, FT>>;
  }

  public skipOn<K extends keyof P>(
    key: K & (K extends RestrictedKeys ? never : {}),
    skipPredicate: SkipPredicate<P, P[K]>,
  ) {
    const fieldData = this.packetFields.get(key);
    if (!fieldData) throw new STypeError("INVALID_FIELD_KEY", key as string);
    fieldData.skipOn = skipPredicate;
    this.packetFields.set(key, fieldData);

    return this;
  }

  public async populate(consumer: Consumer, current: KnownPacketFields) {
    const fields = current as P;
    for (const [key, fieldInfo] of this.packetFields.entries()) {
      const val = await fieldInfo.fieldCodec.decode(consumer);
      if (fieldInfo.validator?.(val) ?? false) {
        throw new STypeError("MALFORMED_PACKET", key as string, val);
      }

      fields[key] = val;
      fieldInfo.skipOn?.(fields, val);
    }

    return fields;
  }

  public getScaffold() {
    return { id: this.id } as P;
  }
}

export default PacketCodec;
