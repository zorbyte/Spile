import { mainLog } from "@lib/mainLog";

import AnyServer from "../BaseServer";

// This doesn't extend SimpleServer because it listens on the same port as the main server in some cases.
class QueryServer implements AnyServer {
  private log = mainLog.child("query");

  // eslint-disable-next-line @typescript-eslint/require-await
  public async listen(): Promise<void> {
    this.log.info("Dummy query server is \"listening\"");
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async close(): Promise<void> {
    this.log.info("Dummy query server is \"closing\"");
  }
}

export default QueryServer;
