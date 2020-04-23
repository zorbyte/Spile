import Packet from "@net/server/Packet";

class Request extends Packet<Request> {
  public static id = 0x0;
  
  public constructor() {
    super(Request.id);
  }

  public async deserialise(): Promise<Request> {
    return this;
  }
}

export default Request;
