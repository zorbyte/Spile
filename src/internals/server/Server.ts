import Logger from "../cli/Logger";
import Packet from "./Packet";

class Server {
  public constructor(private log: Logger) { }

  public encode(packet: Packet) {
    this.log.debug("Encoding packet");
  }
}

export default Server;
