import { Socket } from "net";

import Player from "@game/Player";
import { MAX_PACKET_LEN } from "@lib/constants";
import Logger from "@utils/Logger";

import handleLegacyPing from "./handleLegacyPing";
import Packet from "./Packet";
import { decode, encode } from "./packetCodec";
import State from "./State";

enum DirectionLabel {
  I = "C->S",
  O = "S->C",
}

class Client {
  public state = State.SHAKE;
  public player?: Player;
  public compressionThresh = -1;

  private scheduledClose: boolean | string = false;

  public constructor(private socket: Socket, public log: Logger) {
    // Disable Naggle's algorithm so we have better latency.
    this.socket.setNoDelay();

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.socket.on("data", this.handleRequest.bind(this));

    this.socket.on("error", (err: Error & { code?: string }) => {
      if (err?.code === "ECONNRESET") {
        this.log.debug("Connection was terminated prematurely by the remote host");
      } else {
        this.log.quickError("An error occurred in a socket", err);
      }
    });
  }

  public closePostRequest(reason?: string) {
    this.scheduledClose = reason ?? true;
  }

  public close(_reason?: string) {
    // TODO: Send a chat message packet.
    this.socket.removeAllListeners("data");
    this.socket.destroy();
  }

  private closeIfNeeded() {
    const clsAfterStr = typeof this.scheduledClose === "string";
    if (this.scheduledClose || clsAfterStr) return this.close(clsAfterStr ? this.scheduledClose as string : void 0);
  }

  private async handleRequest(data: Buffer) {
    let curDir = DirectionLabel.I;
    let handleAfter: Buffer;
    let resBuf: Buffer;
    let resPacket: Packet;

    try {
      // Prevent malicious allocations that slow down the server.
      if (data.length > MAX_PACKET_LEN) return this.close();

      // Legacy ping will start with 0xFE.
      const handlingLegacyPing = data[0] === 0xFE;
      if (handlingLegacyPing) {
        resBuf = await handleLegacyPing(this);
      } else {
        const decodeRes = await decode(data, this.state, this.compressionThresh);

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
          // Let it handle the request first, since any scheduled closures
          // would be unaware of proceeding packets.
          if (handleAfter!) await this.handleRequest(handleAfter!);
          this.closeIfNeeded();
          return;
        }

        curDir = DirectionLabel.O;

        // encode the response packet.
        resBuf = await encode(resPacket, this.compressionThresh) as Buffer;

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

          // Don't worry about catching this, if it has an error it should handle it itself.
          // If it doesn't, we'd probably want it to fail spectacularly so we'd know about it.
          if (handleAfter) await this.handleRequest(handleAfter);

          this.closeIfNeeded();
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
