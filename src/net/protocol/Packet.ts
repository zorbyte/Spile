import { SError } from "@lib/errors";
import { Enumerable } from "@utils/utils";

import Client from "./Client";
import Field from "./Field";

type FieldGeneric<T> = T extends Field<infer FType> ? FType : never;
type BuiltPacket <P extends Packet> = Omit<P, Readonly<"addField" | "build" | "onRun">>;
type PacketHook<P extends Packet> = (client: Client, packet: BuiltPacket<P>) => Promise<Packet | void> | Packet | void;

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
  private fields = new Map<string, Field<unknown>>();

  @Enumerable(false)
  private runHook?: PacketHook<this>;

  // eslint-disable-next-line constructor-super
  public constructor(
    public readonly id: number,
    private readonly name: string,
    private readonly direction: "I" | "O",
  ) {}

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
