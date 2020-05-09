import fjs from "fast-json-stringify";
import secJsonParse from "secure-json-parse";

import ByteConsumer from "../ByteConsumer";
import Field, { StringLength } from "../Field";

import MCString from "./MCString";
import VarInt from "./VarInt";

class MCJSON<T> implements Field<T> {
  private stringify: (doc: T) => string;

  public constructor(schema: fjs.ObjectSchema) {
    this.stringify = fjs(schema) as unknown as (doc: T) => string;
  }

  public async serialise(data: T, ..._n: StringLength<T>): Promise<Buffer> {
    const jAsStr = this.stringify(data);
    const len = jAsStr.length;
    const lenBuff = await VarInt.serialise(len);
    const jsonBuff = await MCString.serialise(jAsStr, len);

    return Buffer.concat([lenBuff, jsonBuff], lenBuff.length + jsonBuff.length);
  }

  public async deserialise(consumer: ByteConsumer, ..._n: StringLength<T>): Promise<T> {
    const len = await VarInt.deserialise(consumer);
    const rawJson = await MCString.deserialise(consumer, len);

    return secJsonParse(rawJson);
  }
}

export default MCJSON;
