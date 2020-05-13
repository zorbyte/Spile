import { Socket } from "net";

import Player from "@game/Player";
import Logger from "@utils/Logger";

import Packet from "./Packet";
import { deserialise, serialise } from "./packetCodec";
import State from "./State";

enum DirectionLabel {
  I = "C->S",
  O = "S->C",
}

class Client {
  public state = State.SHAKE;

  // TODO: Check if this is futile. Probably is since this is runtime related.
  public player: this["state"] extends State.PLAY ? Player : void;
  private compressionThresh = -1;

  public constructor(private socket: Socket, public log: Logger) {
    // Disable Naggle's algorithm so we can serve more users concurrently.
    this.socket.setNoDelay(true);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.socket.on("data", this.handleRequest.bind(this));
  }

  public close(_reason?: string) {
    // TODO: Send a chat message packet.
    this.log.debug("Terminated a socket.");
    this.socket.removeAllListeners("data");
    this.socket.destroy();
  }

  private async handleRequest(data: Buffer) {
    let curDir = DirectionLabel.I;

    try {
      const packet = await deserialise(data, this.state, this.compressionThresh);

      // Invalid packet id.
      if (!packet) return this.close();

      this.log.logPacket(getHandleMessage(packet, DirectionLabel.I), packet);

      const hook = Packet.getRunHook(packet);
      const resPacket = await hook(packet, this);

      // If the packet run hook doesn't return a packet to respond with, just stop handling this request.
      if (!resPacket || this.socket.destroyed) return this.close();

      curDir = DirectionLabel.O;

      // Serialise the response packet.
      const resBuf = await serialise(resPacket, this.compressionThresh);

      this.socket.write(resBuf, err => {
        this.log.logPacket(getHandleMessage(resPacket, DirectionLabel.O), resPacket);
        if (err) {
          this.log.quickError("An error occurred while writing to a socket!", err);
          this.close();
        } else {
        }
      });
    } catch (err) {
      this.log.quickError(`${curDir} An error occurred while handling a packet.`, err);
      this.close();
    }
  }
}

function getHandleMessage(packet: Packet, direction: DirectionLabel) {
  return `${
    direction === DirectionLabel.I ? "Handling" : "Completed"
  } packet ${direction} 0x${packet.id.toString(16).toUpperCase()} ${Packet.getName(packet)}.`;
}

export default Client;
