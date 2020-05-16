import { Socket } from "net";

import Player from "@game/Player";
import { MAX_PACKET_LEN } from "@lib/constants";
import Logger from "@utils/Logger";

import handleLegacyPing from "./handleLegacyPing";
import Packet, { BuiltPacket } from "./Packet";
import { decode, encode } from "./packetCodec";
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

  // These are the names of the packets that the decoder should find an alternative for.
  // This means for instance if Request occurs, it will ad itself to this list in order for ping (which shares the same ID)
  // to be ran afterwards.
  private blacklistedPackets: string[] = [];

  public constructor(private socket: Socket, public log: Logger) {
    // Disable Naggle's algorithm so we have better latency.
    this.socket.setNoDelay();

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.socket.on("data", this.handleRequest.bind(this));

    this.socket.on("close", () => {
      this.log.debug("Socket closed.");
    });

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
    let handleAfter: Buffer;
    let resBuf: Buffer;
    let resPacket: Packet;

    try {
      this.log.debug("Incoming packet");
      // Prevent malicious allocations that slow down the server.
      if (data.length > MAX_PACKET_LEN) return this.close();

      const handlingLegacyPing = data[0] === 0xFE;
      if (handlingLegacyPing) {
        resBuf = await handleLegacyPing(this);
      } else {
        const decodeRes = await decode(data, this.state, this.blacklistedPackets, this.compressionThresh);

        // No packet found.
        if (!decodeRes) return this.close();

        let packet: Packet;
        if (Array.isArray(decodeRes)) [packet, handleAfter] = decodeRes;
        else packet = decodeRes;

        this.log.logPacket(getHandleMessage(packet, DirectionLabel.I), packet);

        const hook = Packet.getRunHook(packet);
        resPacket = await hook(packet, this) as Packet;

        if (this.socket.destroyed) return this.close();

        if (!resPacket) {
          if (handleAfter) await this.handleRequest(handleAfter);
          return;
        }

        curDir = DirectionLabel.O;

        // encode the response packet.
        resBuf = await encode(resPacket, this.compressionThresh);

        if (!resBuf) return this.close();
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.socket.write(resBuf, async writeErr => {
        try {
          if (writeErr) throw writeErr;
          if (handlingLegacyPing) {
            this.log.debug(getHandleMessage({ id: 0xFF } as Packet, DirectionLabel.O, "legacy ping"));
          } else {
            this.log.logPacket(getHandleMessage(resPacket, DirectionLabel.O), resPacket);
          }

          const clsAfterStr = typeof this.scheduledClose === "string";
          if (this.scheduledClose || clsAfterStr) return this.close(clsAfterStr ? this.scheduledClose as string : void 0);
        } catch (err) {
          this.log.quickError("An error occurred while writing to a socket", err);
          this.close();
        }

        // Don't worry about catching this, if it has an error it should handle it itself.
        // If it doesn't, we'd probably want it to fail spectacularly so we'd know about it.
        if (handleAfter) await this.handleRequest(handleAfter);
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
