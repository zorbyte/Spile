import { SError, STypeError } from "@lib/errors";
import { Asyncable, Predicate } from "@utils/typeUtils";
import { Enumerable } from "@utils/utils";

import { Predicate as OwPredicate } from "ow";

import Client from "./Client";
import Field from "./Field";
import State from "./State";

type BuilderMethods = "addField" | "compile" | "onBuilt" | "skipField";
type RestrictedKeys = BuilderMethods | "packetLength" | "dataLength" | "id";
export type PacketDirection = "I" | "O";
export type BuiltPacket<P extends Packet> = Omit<P, Readonly<BuilderMethods>>;
type FieldGeneric<T> = T extends Field<infer FType> ? FType : never;
type PacketHook<P extends Packet> = (packet: BuiltPacket<P>, client: Client) => Asyncable<BuiltPacket<Packet> | void>;

interface FieldData<T, P extends Packet> {
  validator?: OwPredicate<T>;
  skipFieldOn?: Predicate<BuiltPacket<P>>;
  hasDefault: boolean;
  field: Field<T>;
}

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

  // #region Getters and setters.

  public static getName(packet: Packet) {
    return packet[kName];
  }

  public static getDirection(packet: Packet) {
    return packet[kDirection];
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

  // #endregion

  @Enumerable(false)
  private [kName]: string;

  @Enumerable(false)
  private [kDirection]?: PacketDirection;

  @Enumerable(false)
  private [kState]: State;

  @Enumerable(false)
  private [kFields] = new Map<string | symbol, FieldData<any, this>>();

  @Enumerable(false)
  private [kRunHook]?: PacketHook<this>;

  // Payload data.
  // Packet and data length get handed in the serialisation function and are not present on outbound packets.
  // These have to be handled later. As this represents the size of the packet after the fact.
  @Enumerable(false)
  private [kPacketLength]?: number;

  @Enumerable(false)
  private [kDataLength] = 0;

  public constructor(public readonly id: number, name: string, direction: PacketDirection) {
    this[kName] = name;
    this[kDirection] = direction;
  }

  public get packetLength() {
    return this[kPacketLength];
  }

  public get dataLength() {
    return this[kDataLength];
  }

  @Enumerable(false)
  public addField<T extends string, F extends Field<any>, FT extends FieldGeneric<F>, P extends this & Record<T, FT>>(
    key: T & (T extends RestrictedKeys ? "Invalid key" : {}),
    field: F,
    defaultVal?: FT,
    validator?: OwPredicate<FT>,
  ): P {
    const fieldData: FieldData<FT, this> = { field, hasDefault: !!defaultVal };

    if (validator) fieldData.validator = validator;
    this[kFields].set(key, fieldData);
    this[key as keyof this] = defaultVal;

    return this as P;
  }

  @Enumerable(false)
  public skipField<P extends BuiltPacket<this>>(key: Exclude<keyof P, RestrictedKeys>, predicate: Predicate<P>) {
    const fieldData = this[kFields].get(key as string);
    if (!fieldData) throw new SError("INVALID_FIELD_KEY", key as string);

    fieldData.skipFieldOn = predicate as Predicate<BuiltPacket<this>>;
    this[kFields].set(key as string, fieldData);

    return this;
  }

  @Enumerable(false)
  public onBuilt(hook: PacketHook<this>) {
    this[kRunHook] = hook;

    return this;
  }

  @Enumerable(false)
  public compile(): BuiltPacket<this> {
    // Great place to check if it is a valid inbound hook.
    if (this[kDirection] === "I" && !this[kRunHook]) throw new STypeError("INBOUND_PACKET_HOOK_ABSENT", this[kName]);

    return this;
  }
}

export default Packet;
