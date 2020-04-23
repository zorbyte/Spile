import Logger from "@internals/console/Logger";

import ByteConsumer from "./ByteConsumer";
abstract class Packet<P extends Packet<P>> {
  public static id: number;
  private static log: Logger;

  public static bindLogger(log: Logger): void {
    Packet.log = log;
  }

  protected constructor(public id: number) {
    if (!Packet.log) throw new Error("A logger has not been bound to the base packet yet!");
  }

  public serialise?(compressionThreshold: number): Promise<Buffer>;
  public deserialise?(consumer: ByteConsumer): Promise<P>;
}

export default Packet;
