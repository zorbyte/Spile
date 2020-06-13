import { STypeError } from "@utils/errors/mod.ts";
import { Asyncable, Predicate } from "@utils/type_utils.d.ts";

import { Consumer } from "./consumer.ts";

type Encoder<T> = (data: T) => Asyncable<Uint8Array>;
type Decoder<T> = (consumer: Consumer) => Promise<T>;

type ProcessTypeName = "encode" | "decode" | "none";
type ProcessVerb = "encoding" | "decoding";

export interface FieldCodec<T extends unknown> {
  encode: Encoder<T>;
  decode: Decoder<T>;
}

export class FieldCodecBuilder<T extends unknown> {
  private encoder!: Encoder<T>;
  private encoderValidator?: Predicate<T>;

  private decoder!: Decoder<T>;
  private decoderValidator?: Predicate<T>;

  private lastRegistered: ProcessTypeName = "none";

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
        this.isValid(value, "encoding");
        const data = await this.encoder(value);

        return data;
      },
      decode: async (consumer: Consumer) => {
        const data = await this.decoder(consumer);
        this.isValid(data, "decoding");

        return data;
      },
    };
  }

  private isValid(data: T, process: ProcessVerb) {
    const passed = this
      ?.[
        process === "encoding" ? "encoderValidator" : "decoderValidator"
      ]?.(data) ?? true;

    if (!passed) {
      throw new STypeError(
        "INVALID_FIELD_DATA",
        this.fieldTypeName,
        process,
        data,
      );
    }
  }
}
