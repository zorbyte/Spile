import { parseHeaders } from "./io_utils.ts";

import Listener = Deno.Listener;
import Conn = Deno.Conn;

const { listen } = Deno;

const connections = new Set<Conn>();
let listener: Listener;
let open = false;

/**
 * Makes the server listen.
 * @param host In the following format: host:port.
 */
export async function serve(host: string) {
  const opts: Partial<Deno.ListenOptions> = {};
  const optsSplit = host.split(":") as [string, number];
  optsSplit[1] = parseInt((optsSplit[1] as unknown) as string);
  [opts.hostname, opts.port] = optsSplit;

  listener = listen(opts as Deno.ListenOptions);
  open = true;

  acceptConns();
}

export function close() {
  open = false;
  listener?.close();
  for (const conn of connections) {
    try {
      conn.close();
    } catch (err) {
      // Connection might have been already closed
      if (!(err instanceof Deno.errors.BadResource)) throw err;
    }
  }
}

async function acceptConns() {
  while (open) {
    let conn: Conn;
    try {
      conn = await listener.accept();
    } catch (err) {
      // Connection might have been already closed
      if (!(err instanceof Deno.errors.BadResource)) throw err;
      return;
    }

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
