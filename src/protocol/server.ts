import { parseHeaders } from "./io_utils.ts";

import Listener = Deno.Listener;
import Conn = Deno.Conn;
import { Context } from "./context.ts";

const { listen: listenTcp } = Deno;

const connections = new Set<Conn>();
let listener: Listener;
let open = false;

interface ServeOptions {
  hostname: string;
  port: number;
}

async function acceptConnections() {
  for await (const conn of listener) handleConnection(conn);
}

async function handleConnection(conn: Conn) {
  const ctx = new Context(conn);

  while (open && !ctx.closed) {
    // TODO: Get legit data.
    const headerData = await parseHeaders(conn, {
      encrypted: false,
      compressed: false,
      compressionThreshold: -1,
    });

    if (!headerData) continue;

    // TODO: Change to @ts-expect-error in future.
    // @ts-ignore
    const { packetLength, dataLength, id } = headerData;
  }
}

export async function listen(opts: ServeOptions) {
  listener = listenTcp(opts);
  open = true;

  acceptConnections();
}

export function close() {
  open = false;
  listener?.close();
  for (const conn of connections) {
    try {
      conn.close();
    } catch (err) {
      // Connection might have been already closed.
      if (!(err instanceof Deno.errors.BadResource)) throw err;
    }
  }
}
