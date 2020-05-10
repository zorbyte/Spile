import { SError } from "@lib/errors";
import { Asyncable } from "@utils/typeUtils";
import { Enumerable } from "@utils/utils";

import VarInt from "./fields/VarInt";
import Client from "./Client";
import Field from "./Field";

type BuilderMethods = "addField" | "build" | "onRun";
type FieldGeneric<T> = T extends Field<infer FType> ? FType : never;
type BuiltPacket<P extends Packet> = Omit<P, Readonly<BuilderMethods>>;
type PacketHook<P extends Packet> = (client: Client, packet: BuiltPacket<P>) => Asyncable<Packet | void>;

export const kLength = Symbol.for("packetLength");
export const kCompressedLength = Symbol.for("packetCompressedLength");

class Packet {
  public static getName(packet: Packet) {
    return packet.name;
  }

  public static getDirection(packet: Packet) {
    return packet.direction;
  }

  public static getRunHook(packet: Packet) {
    return packet.runHook;
  }

  public static getFields(packet: Packet) {
    return packet.fields;
  }

  @Enumerable(false)
  private fields = new Map<string | symbol, Field<any>>();

  @Enumerable(false)
  private runHook?: PacketHook<this>;

  @Enumerable(false)
  private [kLength]?: number;

  @Enumerable(false)
  private [kCompressedLength]?: number;

  // eslint-disable-next-line constructor-super
  public constructor(
    public readonly id: number,
    private readonly name: string,
    private readonly direction: "I" | "O",
  ) {
    this.fields.set(kCompressedLength, VarInt);
    this.fields.set(kLength, VarInt);
    this.fields.set("id", VarInt);
  }

  public get length() {
    return this[kLength];
  }

  public set length(newLen: number) {
    if (!this[kLength] && this.direction === "I") this[kLength] = newLen;
  }

  public get compressedLength() {
    return this[kCompressedLength];
  }

  public set compressedLength(newLen: number) {
    if (!this[kCompressedLength] && this.direction === "I") this[kCompressedLength] = newLen;
  }

  @Enumerable(false)
  public addField<T extends string, F extends Field<any>, FT = FieldGeneric<F>>(
    key: T,
    field: F,
    defaultVal?: FT,
  ): this & Record<T, FT> {
    this.fields.set(key, field);

    // @ts-expect-error - This is valid, as the returned type by this function has this property.
    this[key] = defaultVal;

    return this as this & Record<T, FT>;
  }

  @Enumerable(false)
  public onRun(hook: PacketHook<this>) {
    this.runHook = hook;

    return this;
  }

  @Enumerable(false)
  public build(): BuiltPacket<this> {
    // Inbound packets need a hook.
    if (!this.runHook && this.direction === "I") throw new SError("PACKET_BUILDER_LAST_NOT_RUN");

    return this;
  }
}

export default Packet;
