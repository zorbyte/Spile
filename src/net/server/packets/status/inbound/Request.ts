import Packet from "@net/server/packets/Packet";

class Request extends Packet<Request> {
  public static id = 0x0;

  public constructor() {
    super(Request.id);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async deserialise(): Promise<Request> {
    return this;
  }
}

export default Request;
