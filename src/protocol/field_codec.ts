import { STypeError } from "../errors/mod.ts";
import { Asyncable, Predicate } from "../utils/type_utils.d.ts";

import { Consumer } from "./consumer.ts";

type Encoder<T> = (data: T) => Asyncable<Uint8Array>;
type Decoder<T> = (consumer: Consumer) => Promise<T>;

export interface FieldCodec<T extends unknown> {
  encode: Encoder<T>;
  decode: Decoder<T>;
}

export class FieldCodecBuilder<T extends unknown> {
  private encoder!: Encoder<T>;
  private encoderValidator?: Predicate<T>;

  private decoder!: Decoder<T>;
  private decoderValidator?: Predicate<T>;

  private lastRegistered: "encode" | "decode" | "none" = "none";

  public constructor(private fieldTypeName: string) {}

  public encode(encoder: Encoder<T>) {
    this.encoder = encoder;
    this.lastRegistered = "encode";

    return this;
  }

  public decode(decoder: Decoder<T>) {
    this.decoder = decoder;
    this.lastRegistered = "decode";

    return this;
  }

  public validate(validator: Predicate<T>) {
    switch (this.lastRegistered) {
      case "none":
      case "encode":
        this.encoderValidator = validator;
        if (this.lastRegistered !== "none") break;
      case "decode":
        this.decoderValidator = validator;
        break;
    }

    return this;
  }

  public compile(): FieldCodec<T> {
    if (!this.encoder || !this.decoder) {
      throw new Error(
        `The field ${this.fieldTypeName} is missing either an encoder or decoder`,
      );
    }

    return {
      encode: async (value: T) => {
        const passed = this.encoderValidator?.(value) ?? true;
        if (!passed) {
          throw new STypeError(
            "FIELD_DATA_INVALID",
            this.fieldTypeName,
            "decoding",
            value,
          );
        }

        const data = await this.encoder(value);
        return data;
      },
      decode: async (consumer: Consumer) => {
        const data = await this.decoder(consumer);
        const passed = this.decoderValidator?.(data) ?? true;
        if (!passed) {
          throw new STypeError(
            "FIELD_DATA_INVALID",
            this.fieldTypeName,
            "decoding",
            data,
          );
        }

        return data;
      },
    };
  }
}
