import { EventEmitter } from "events";
import { Socket } from "net";

import Logger from "@internals/console/Logger";
import { inflate } from "@utils/utils";

import VarInt from "./codecs/types/VarInt";
import ByteConsumer from "./ByteConsumer";

export enum State {
  SHAKE,
  STATS,
  LOGIN,
  PLAY,
}

class Client extends EventEmitter {
  public state = State.SHAKE;
  private compression = false;

  public constructor(private socket: Socket, private log: Logger) {
    super();
    // Consider disabling Naggle's algorithm if the latency isn't good.
    // this.socket.setNoDelay(true);
    this.socket.on("data", async data => {
      this.log.debug(`Incoming Packet. compressed=${this.compression}`);
      const consumer = new ByteConsumer(data);
      await VarInt.deserialise(consumer);
      const dataLengthOrId = await VarInt.deserialise(consumer);
      
      let id: number;
      if (this.compression && dataLengthOrId !== 0) {
        const remaining = consumer.drain();
        const newData = await inflate(remaining);
        consumer.replaceBuffer(newData, dataLengthOrId);
        id = await VarInt.deserialise(consumer);
      } else {
        id = dataLengthOrId;
      }
    });
  }
}

export default Client;