import { STypeError } from "@utils/errors/mod.ts";

import { Consumer } from "./consumer.ts";
import { FieldCodec } from "./field_codec.ts";

// Inbound, Outbound, Bidirectional.
type Direction = "I" | "O" | "B";
type RestrictedKeys = keyof KnownPacketFields;
type FieldCodecType<T> = T extends FieldCodec<infer FType> ? FType : never;
type FieldPredicate<
  P extends KnownPacketFields,
  F extends keyof P,
  PT = Omit<PacketType<P>, F>,
> = (data: P[F], packet: PT) => boolean;

type RestrictedKeysCheck<K> = K & (K extends RestrictedKeys ? never : {});

export type PacketType<P extends KnownPacketFields> = P extends
  PacketCodec<infer PType, any> ? PType
  : never;

interface FieldInfo<
  P extends KnownPacketFields,
  T extends keyof P,
  F = FieldCodec<T>,
> {
  codec: F;
  validate?: FieldPredicate<P, T>;
  skip?: FieldPredicate<P, T>;
}

interface KnownPacketFields {
  readonly packetLength: number;
  readonly dataLength: number;
  readonly id: number;
}

class PacketCodec<
  P extends KnownPacketFields,
  NK extends keyof P,
> {
  public name: string;

  private lastField!: NK;
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
    FT extends FieldCodecType<F>,
  >(key: RestrictedKeysCheck<T>, fieldCodec: F) {
    const fieldInfo: FieldInfo<P, FT> = { codec: fieldCodec };

    this.packetFields.set(key as keyof P, fieldInfo);
    this.lastField = key as unknown as NK;

    return this as unknown as PacketCodec<P & Record<T, FT>, T>;
  }

  public validate(
    isValid: FieldPredicate<P, NK>,
  ) {
    this.addPredicate("validate", isValid);

    return this;
  }

  public skip(
    shouldSkip: FieldPredicate<P, NK>,
  ) {
    this.addPredicate("skip", shouldSkip);

    return this;
  }

  public async populate(consumer: Consumer, current: KnownPacketFields) {
    const fields = current as P;
    for (const [key, fieldInfo] of this.packetFields.entries()) {
      const val = await fieldInfo.codec.decode(consumer);
      if (fieldInfo.validate?.(val, fields) ?? false) {
        throw new STypeError(
          "PACKET_FIELD_VALIDATION_FAILURE",
          this.name,
          key as string,
          val,
        );
      }

      if (fieldInfo.skip?.(val, fields) ?? false) continue;

      fields[key] = val;
    }

    return fields;
  }

  private addPredicate(
    field: "validate" | "skip",
    predicate: FieldPredicate<P, NK>,
  ) {
    const fieldData = this.packetFields.get(this.lastField) as FieldInfo<P, NK>;
    fieldData[field] = predicate;
    this.packetFields.set(this.lastField, fieldData);
  }
}

export default PacketCodec;
