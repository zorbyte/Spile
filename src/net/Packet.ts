import isPromise from "is-promise";

import Codec from "./Codec";

interface InternalField<P> {
  key: keyof P;
  codec: Codec<any>;
}

export interface Field<P> extends InternalField<P> {
  key: Exclude<keyof P, "length" | "compressedLength" | "id">;
}

const test: Codec<number> = {
  serialise(_data) { return new Uint8Array(); },
  deserialise(_raw) { return 1; },
};


abstract class Packet<P extends Packet<P>> {
  public length: number;
  public compressedLength?: number;

  public constructor(public id: number, private fields: Field<P>[]) {
    (this.fields as InternalField<P>[]).unshift(
      { key: "length", codec: test },
      { key: "compressedLength", codec: test },
      { key: "id", codec: test },
    );
  }

  protected async _serialise(compressed: boolean, _encrypted: boolean, ...args: any[]): Promise<Uint8Array> {
    let allowedLen = this.fields.length;
    if (!compressed) allowedLen--;
    if (args.length > allowedLen) throw new Error(`Invalid amount of arguments for packet ${this.id}`);
    let i = 0;
    const chunks: Uint8Array[] = [];
    for (const field of this.fields) {
      const chunk = args[i];
      let ser = field.codec.serialise(chunk);
      if (isPromise(ser)) ser = await ser;
      i++;
    }

    return chunks.reduce((acc, arr) => new Uint8Array([...acc, ...arr]), new Uint8Array());
  }
}

export default Packet;
