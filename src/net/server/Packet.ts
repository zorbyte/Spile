import Logger from "@internals/console/Logger";

abstract class Packet<P extends Packet<P>> {
  public static id = 0x0;
  private static log: Logger;

  public static bindLogger(log: Logger): void {
    Packet.log = log;
  }

  protected constructor(public id: number) {
    if (!Packet.log) throw new Error("A logger has not been bound to the base packet yet!");
  }

  public abstract serialise(): Promise<Buffer>;
  public abstract deserialise(): Promise<P>;
}

export default Packet;
