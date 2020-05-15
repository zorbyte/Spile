import { Server } from "net";

import { mainLog } from "@lib/mainLog";
import { stop } from "@lib/mediator";

import BaseServer from "./BaseServer";

abstract class SimpleServer<S extends Server> implements BaseServer {
  public listening = false;

  protected log = mainLog.child(this.name);

  // The internal server instance.
  public abstract server: S;

  public constructor(protected name: string, protected port: number) {}

  // Listens on the desired port and hostname.
  public listen(hostname?: string) {
    return new Promise((resolve, reject) => {
      const errorCb = (err: Error) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        this.server.off("listening", listenCb);
        reject(err);
      };

      const listenCb = () => {
        this.server.off("error", errorCb);
        this.server.once("error", err => {
          this.log.quickError(`An error occurred in the ${this.name} server`, err);
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          stop();
        });

        resolve();
      };

      this.server.once("listening", listenCb);
      this.server.once("error", errorCb);

      this.log.debug(`Opening ${this.name} server on port ${this.port}`);
      this.server.listen(this.port, hostname);
    });
  }

  public close() {
    return new Promise((resolve, reject) => {
      if (!this.listening) return resolve();
      this.log.debug(`Closing ${this.name} server`);
      this.server.close(err => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

export default SimpleServer;
