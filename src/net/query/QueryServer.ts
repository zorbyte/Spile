import Spile from "@internals/Spile";

import AnyServer from "../AnyServer";

/**
 * This doesn't extend SimpleServer because it listens on the same port as the main server.
 */
class QueryServer implements AnyServer {
  private log = this.spile.log.child("query");

  public constructor(private spile: Spile) { }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async listen(): Promise<void> {
    this.log.info("Dummy query server is \"listening\".");
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async close(): Promise<void> {
    this.log.info("Dummy query server is \"closing\".");
  }
}

export default QueryServer;
