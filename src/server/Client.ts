/**
 * Spile Minecraft Server
 * @author zorbyte <zorbytee@gmail.com>
 *
 * @license
 * Copyright (C) 2020 The Spile Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https: //www.gnu.org/licenses/>.
 */

import { EventEmitter } from "events";
import { Socket } from "net";

export enum State {
  SHAKE,
  STATS,
  LOGIN,
  PLAY,
}

class Client extends EventEmitter {
  public state = State.SHAKE;

  public constructor(private socket: Socket) {
    super();
    // Consider disabling Naggle's algorithm if the latency isn't good.
    // this.socket.setNoDelay(true);
    // @ts-ignore
    this.socket.on("data", (data: Uint8Array) => { /* noop */ }); // eslint-disable-line no-inline-comments
  }
}

export default Client;
