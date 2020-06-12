import { STypeError } from "@utils/errors/mod.ts";
import { Asyncable } from "@utils/type_utils.d.ts";

import { Consumer } from "./consumer.ts";
import { FieldCodec } from "./field_codec.ts";
import { Context } from "./context.ts";
import { ProtocolHeaders, Collator } from "./io_utils.ts";

type RestrictedKeys = keyof ProtocolHeaders;
type RestrictedKeysCheck<K> = K & (K extends RestrictedKeys ? never : {});
type FieldCodecType<T> = T extends FieldCodec<infer FType> ? FType : never;
type FieldPredicate<
  P extends ProtocolHeaders,
  F extends keyof P,
  PAtTime = Omit<P, F>,
> = (data: P[F], packet: PAtTime) => boolean;

// Inbound and Outbound.
type PacketDirection = "I" | "O";
type PacketHook<P extends ProtocolHeaders> = (
  ctx: Context<P>,
) => Asyncable<ProtocolHeaders & unknown | void>;

export interface PacketCodec<P extends ProtocolHeaders> {
  decode(consumer: Consumer, headers: ProtocolHeaders): Promise<P>;
  encode(insert: Collator, data: P): Promise<void>;
  getScaffold(): P;
  runHook?: PacketHook<P>;
}

interface FieldInfo<
  P extends ProtocolHeaders,
  T extends keyof P,
  F = FieldCodec<T>,
> {
  codec: F;
  validate?: FieldPredicate<P, T>;
  skip?: FieldPredicate<P, T>;
}

export class PacketCodecBuilder<
  P extends ProtocolHeaders,
  NK extends keyof P,
> {
  public direction = "I" as PacketDirection;

  // Used to add validators to.
  private lastField?: NK;
  private packetFields = new Map<keyof P, FieldInfo<P, any>>();

  public constructor(
    public id: number,
    public name: string,
  ) {}

  public addField<
    T extends string,
    F extends FieldCodec<any>,
    FT extends FieldCodecType<F>,
  >(key: RestrictedKeysCheck<T>, fieldCodec: F) {
    const fieldInfo: FieldInfo<P, FT> = { codec: fieldCodec };

    this.packetFields.set(key as keyof P, fieldInfo);
    this.lastField = key as unknown as NK;

    // Keeps track of the type that will be built on compilation.
    // The second generic was the key added, for types on predicates
    // that rely on the previous field.
    return this as unknown as PacketCodecBuilder<P & Record<T, FT>, T>;
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

  // A public form to use the packet codec.
  public compile(hook?: PacketHook<P>) {
    const compiled = {
      decode: this.decode.bind(this),
      encode: this.encode.bind(this),

      // If the packet were to be created for outbound,
      // use this as starting point and modify the object.
      getScaffold: () => ({ id: this.id } as P),
    } as PacketCodec<P>;

    if (hook) {
      // Packets with run hooks are outbound packets.
      this.direction = "O";
      compiled.runHook = hook;
    }

    return compiled;
  }

  // Generally, avoid using side effects like this
  // however concatenation is an operation that should only happen at the end
  // as it is a costly operation.
  private async encode(insert: Collator, data: P) {
    for (const [key, fieldInfo] of this.packetFields.entries()) {
      const fieldVal = data[key];
      if (fieldInfo.skip?.(data, fieldVal) ?? false) continue;
      const bytes = await fieldInfo.codec.encode(insert);
      if (fieldInfo.validate) {
        this.validateField(data, fieldInfo.validate, key, fieldVal);
      }

      insert(bytes, "append");
    }
  }

  private async decode(consumer: Consumer, headers: ProtocolHeaders) {
    const data = { ...headers } as P;
    for (const [key, fieldInfo] of this.packetFields.entries()) {
      const fieldVal = await fieldInfo.codec.decode(
        consumer,
      ) as (typeof data)[keyof typeof data];

      if (fieldInfo.validate) {
        this.validateField(data, fieldInfo.validate, key, fieldVal);
      }

      data[key] = fieldVal;
    }

    return data;
  }

  private validateField<KOP extends keyof P>(
    data: P,
    validate: FieldPredicate<P, KOP>,
    key: KOP,
    fieldVal: P[KOP],
  ) {
    if (!validate(fieldVal, data)) {
      throw new STypeError(
        "PACKET_FIELD_VALIDATION_FAILURE",
        this.name,
        key as string,
        fieldVal as unknown as string,
      );
    }
  }

  private addPredicate(
    field: "validate" | "skip",
    func: FieldPredicate<P, NK>,
  ) {
    const fieldData = this.packetFields.get(this.lastField!) as FieldInfo<P, NK>;
    fieldData[field] = func;
    this.packetFields.set(this.lastField!, fieldData);
  }
}
