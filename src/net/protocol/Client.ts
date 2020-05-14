import { Socket } from "net";

import Player from "@game/Player";
import Logger from "@utils/Logger";

import handleLegacyPing from "./handleLegacyPing";
import Packet from "./Packet";
import { deserialise, serialise } from "./packetCodec";
import State from "./State";

enum DirectionLabel {
  I = "C->S",
  O = "S->C",
}

class Client {
  public state = State.SHAKE;
  public handlingLegacy = false;

  // TODO: Check if this is futile. Probably is since this is runtime related.
  public player: this["state"] extends State.PLAY ? Player : void;
  private compressionThresh = -1;

  public constructor(private socket: Socket, public log: Logger) {
    // Disable Naggle's algorithm so we can serve more users concurrently.
    this.socket.setNoDelay(true);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.socket.on("data", this.handleRequest.bind(this));

    this.socket.on("error", err => {
      // @ts-expect-error
      if (err.code && err.code === "ECONNRESET") {
        this.log.debug("Connection was terminated prematurely by the remote host.");
      } else {
        this.log.quickError("An error occurred in a socket.", err);
      }
    });
  }

  public close(_reason?: string) {
    // TODO: Send a chat message packet.
    this.log.debug("Terminated a socket.");
    this.socket.removeAllListeners("data");
    this.socket.destroy();
  }

  private async handleRequest(data: Buffer) {
    let curDir = DirectionLabel.I;
    let resBuf: Buffer;
    let resPacket: Packet;

    try {
      const handlingLegacyPing = data[0] === 0xFE;
      if (handlingLegacyPing) {
        resBuf = await handleLegacyPing(this);
      } else {
        const packet = await deserialise(data, this.state, this.compressionThresh);

        // Invalid packet id.
        if (!packet) return this.close();

        this.log.logPacket(getHandleMessage(packet, DirectionLabel.I), packet);

        const hook = Packet.getRunHook(packet);
        resPacket = await hook(packet, this) as Packet;

        // If the packet run hook doesn't return a packet to respond with, just stop handling this request.
        if (!resPacket || this.socket.destroyed) return this.close();

        curDir = DirectionLabel.O;

        // Serialise the response packet.
        resBuf = await serialise(resPacket, this.compressionThresh);
      }

      this.socket.write(resBuf, writeErr => {
        try {
          if (writeErr) throw writeErr;
          if (handlingLegacyPing) {
            this.log.debug(getHandleMessage({ id: 0xFF } as Packet, DirectionLabel.O, "legacy ping"));
            this.close();
          } else {
            this.log.logPacket(getHandleMessage(resPacket, DirectionLabel.O), resPacket);
          }
        } catch (err) {
          this.log.quickError("An error occurred while writing to a socket!", err);
          this.close();
        }
      });
    } catch (err) {
      this.log.quickError(`${curDir} An error occurred while handling a packet.`, err);
      this.close();
    }
  }
}

function getHandleMessage(packet: Packet, direction: DirectionLabel, name?: string) {
  return `${
    direction === DirectionLabel.I ? "Handling" : "Completed"
  } packet ${direction} 0x${packet.id.toString(16).toUpperCase()} ${name ?? Packet.getName(packet)}.`;
}

export default Client;
