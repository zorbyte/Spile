import { Socket } from "net";

import Logger from "@utils/Logger";

import Player from "@game/Player";

import Packet from "./Packet";
import { deserialise, serialise } from "./PacketCodec";

export enum State {
  SHAKE,
  STATS,
  LOGIN,
  PLAY,
}

enum DirectionLabel {
  I = "C→S",
  O = "S→C",
}

class Client {
  public state = State.SHAKE;
  // TODO: Check if this is futile. Probably is, since this is runtime related.
  public player: this["state"] extends State.PLAY ? Player : void;
  private compressionThresh = -1;

  public constructor(private socket: Socket, private log: Logger) {
    // Disable Naggle's algorithm so we can serve more users concurrently.
    this.socket.setNoDelay(true);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.socket.on("data", this.handlePacket.bind(this));
  }

  private async handlePacket(data: Buffer) {
    try {
      const packet = await deserialise(data, this.state, this.compressionThresh);

      if (!packet) return;

      this.log.debug(getHandleMessage(packet, DirectionLabel.I));

      const hook = Packet.getRunHook(packet);
      const resPacket = await hook(this, packet);

      if (!resPacket) return;

      const resBuf = await serialise(resPacket, this.compressionThresh);

      this.socket.write(resBuf, err => {
        if (err) this.log.error("An error occurred while writing to the socket!\n", err);
        this.log.debug(getHandleMessage(packet, DirectionLabel.O));
      });
    } catch (err) {
      this.log.error("An error occurred while handling the packet.\n", err);
    }
  }
}

function getHandleMessage(packet: Packet, direction: DirectionLabel) {
  return direction === DirectionLabel.I ? "Handling" : "Completed"
    + ` packet ${direction} 0x${packet.id.toString(16).toUpperCase()} ${Packet.getName(packet)}.`;
}

export default Client;
