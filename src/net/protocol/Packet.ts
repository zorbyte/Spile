import { STypeError } from "@lib/errors";
import { Asyncable } from "@utils/typeUtils";
import { Enumerable } from "@utils/utils";

import VarInt from "./fields/VarInt";
import Client, { State } from "./Client";
import Field from "./Field";

type BuilderMethods = "addField" | "build" | "onRun";
type FieldGeneric<T> = T extends Field<infer FType> ? FType : never;
type BuiltPacket<P extends Packet> = Omit<P, Readonly<BuilderMethods>>;
type PacketHook<P extends Packet> = (client: Client, packet: BuiltPacket<P>) => Asyncable<Packet | void>;

export type PacketDirection = "I" | "O";

// Metadata, not present on payloads.
const kName = Symbol("packetName");
const kState = Symbol("packetState");
const kDirection = Symbol("packetDirection");
const kFields = Symbol("packetFields");
const kRunHook = Symbol("packetRunHook");

// Data lengths, present on payload.
const kPacketLength = Symbol("kPacketLength");
const kDataLength = Symbol("packetDataLength");

class Packet {
  public static getName(packet: Packet) {
    return packet[kName];
  }

  public static getDirection(packet: Packet) {
    return packet[kDirection];
  }

  public static setDirection(packet: Packet, direction: PacketDirection) {
    // Great place to check if it is a valid inbound hook.
    if (direction === "I" && packet[kRunHook]) throw new STypeError("INBOUND_PACKET_HOOK_ABSENT", packet[kName]);
    packet[kDirection] = direction;
  }

  public static setState(packet: Packet, state: State) {
    packet[kState] = state;
  }

  public static getState(packet: Packet) {
    return packet[kState];
  }

  public static getFields(packet: Packet) {
    return packet[kFields];
  }

  public static getRunHook(packet: Packet) {
    return packet[kRunHook];
  }

  public static setPacketLength(packet: Packet, newLen: number) {
    packet[kPacketLength] = newLen;
  }

  public static setDataLength(packet: Packet, newLen: number) {
    packet[kDataLength] = newLen;
  }

  @Enumerable(false)
  private [kName]: string;

  @Enumerable(false)
  private [kDirection]?: PacketDirection;

  @Enumerable(false)
  private [kState]: State;

  @Enumerable(false)
  private [kFields] = new Map<string | symbol, Field<any>>();

  @Enumerable(false)
  private [kRunHook]?: PacketHook<this>;

  // Payload data.
  // Packet and data length get handed in the serialisation function and are not present on outbound packets.
  // These have to be handled later. As this represents the size of the packet after the fact.
  @Enumerable(false)
  private [kPacketLength]?: number;

  @Enumerable(false)
  private [kDataLength] = 0;

  public constructor(public readonly id: number, name: string) {
    this[kName] = name;

    this[kFields].set("id", VarInt);
  }

  public get packetLength() {
    return this[kPacketLength];
  }

  public get dataLength() {
    return this[kDataLength];
  }

  @Enumerable(false)
  public addField<T extends string, F extends Field<any>, FT = FieldGeneric<F>>(
    key: T,
    field: F,
    defaultVal?: FT,
  ): this & Record<T, FT> {
    this[kFields].set(key, field);

    // This is valid, as the returned type by this function has this property.
    this[key as keyof this] = defaultVal as any;

    return this as this & Record<T, FT>;
  }

  @Enumerable(false)
  public onRun(hook: PacketHook<this>) {
    this[kRunHook] = hook;

    return this;
  }

  @Enumerable(false)
  public build(): BuiltPacket<this> {
    return this;
  }
}

export default Packet;
