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

import { Server } from "net";

import Spile from "@lib/Spile";
import AnyServer from "@lib/types/AnyServer";

abstract class SimpleServer<S extends Server> implements AnyServer {
  /**
   * Whether or not the server is listening.
   */
  public listening = false;

  /**
   * The logger for this server.
   */
  protected log = this.spile.log.child(this.name);

  /**
   * The name of the server to use in log messages (padded with a space for even formatting).
   */
  private displayName: string;

  /**
   * The internal server instance.
   */
  protected abstract server: S;

  public constructor(protected name: string, protected port: number, protected spile: Spile) {
    this.displayName = name === "server" ? " " : ` ${name} `;
  }

  /**
   * Listens on the desired port and hostname.
   *
   * @protected
   * @param port {number} The port to listen on.
   * @param hostname {string?} The hostname to listen on.
   */
  protected _listen(hostname?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const errorCb = (err: Error): void => {
        this.server.off("listening", listenCb);
        reject(err);
      };

      const listenCb = (): void => {
        this.server.off("error", errorCb);
        this.server.on("error", err => {
          this.log.error(`An error occurred in the${this.displayName}server!\n`, err);
        });
        resolve();
      };

      this.server.once("listening", listenCb);
      this.server.once("error", errorCb);

      this.server.listen(this.port, hostname);
    });
  }

  protected _close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close(err => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  /**
   * An abstract function that when implemented will call this._listen.
   *
   * @abstract
   * @returns {Promise<void>}
   * @throws {Error}
   */
  public abstract listen(): Promise<void>;

  /**
   * An abstract function that when implemented will call this._close.
   *
   * @abstract
   * @returns {Promise<void>}
   * @throws {Error}
   */
  public abstract close(): Promise<void>;
}

export default SimpleServer;
