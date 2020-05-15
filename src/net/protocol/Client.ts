import { Socket } from "net";

import Player from "@game/Player";
import Logger from "@utils/Logger";

import handleLegacyPing from "./handleLegacyPing";
import Packet, { BuiltPacket } from "./Packet";
import { deserialise, serialise } from "./packetCodec";
import State from "./State";

enum DirectionLabel {
  I = "C->S",
  O = "S->C",
}

class Client {
  public state = State.SHAKE;
  public scheduledClose: boolean | string = false;
  public player?: Player;
  public compressionThresh = -1;

  // These are the names of the packets that the deserialiser should find an alternative for.
  // This means for instance if Request occurs, it will ad itself to this list in order for ping (which shares the same ID)
  // to be ran afterwards.
  private blacklistedPackets: string[] = [];

  public constructor(private socket: Socket, public log: Logger) {
    // Disable Naggle's algorithm so we can serve more users concurrently.
    this.socket.setNoDelay(true);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.socket.on("data", this.handleRequest.bind(this));

    this.socket.on("error", err => {
      // @ts-expect-error
      if (err.code && err.code === "ECONNRESET") {
        this.log.debug("Connection was terminated prematurely by the remote host");
      } else {
        this.log.quickError("An error occurred in a socket", err);
      }
    });
  }

  public close(_reason?: string) {
    // TODO: Send a chat message packet.
    this.log.debug("Terminated a socket");
    this.socket.removeAllListeners("data");
    this.socket.destroy();
  }

  public blacklistPacket(packet: BuiltPacket<Packet>) {
    this.blacklistedPackets.push(Packet.getName(packet as Packet));
  }

  private async handleRequest(data: Buffer) {
    let curDir = DirectionLabel.I;
    let resBuf: Buffer;
    let resPacket: Packet;

    try {
      this.log.debug("Incoming packet");
      const handlingLegacyPing = data[0] === 0xFE;
      if (handlingLegacyPing) {
        resBuf = await handleLegacyPing(this);
      } else {
        const packet = await deserialise(data, this.state, this.blacklistedPackets, this.compressionThresh);

        // Invalid packet id.
        if (!packet) return this.close();

        this.log.logPacket(getHandleMessage(packet, DirectionLabel.I), packet);

        const hook = Packet.getRunHook(packet);
        resPacket = await hook(packet, this) as Packet;

        if (this.socket.destroyed) return this.close();

        if (!resPacket) return;

        curDir = DirectionLabel.O;

        // Serialise the response packet.
        resBuf = await serialise(resPacket, this.compressionThresh);
      }

      this.socket.write(resBuf, writeErr => {
        try {
          if (writeErr) throw writeErr;
          if (handlingLegacyPing) {
            this.log.debug(getHandleMessage({ id: 0xFF } as Packet, DirectionLabel.O, "legacy ping"));
          } else {
            this.log.logPacket(getHandleMessage(resPacket, DirectionLabel.O), resPacket);
          }

          const clsAfterStr = typeof this.scheduledClose === "string";
          if (this.scheduledClose || clsAfterStr) this.close(clsAfterStr ? this.scheduledClose as string : void 0);
        } catch (err) {
          this.log.quickError("An error occurred while writing to a socket", err);
          this.close();
        }
      });
    } catch (err) {
      this.log.quickError(`${curDir} An error occurred while handling a packet`, err);
      this.close();
    }
  }
}

function getHandleMessage(packet: Packet, direction: DirectionLabel, name?: string) {
  return `${direction} 0x${packet.id.toString(16).toUpperCase()} ${name ?? Packet.getName(packet)}${name ? "" : ":"}`;
}

export default Client;
