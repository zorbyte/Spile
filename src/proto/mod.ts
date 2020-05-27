// Inspired by deno/std/http.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import {
  MuxAsyncIterator,
  deferred,
} from "https://deno.land/std@0.52.0/async/mod.ts";

import Conn = Deno.Conn;
import Listener = Deno.Listener;
import { parseHeaders } from "./io_util.ts";

const { listen } = Deno;

class Request {
  public done = deferred<Error | void>();
  public constructor(public conn: Conn) {}
}

const connections = new Set<Conn>();
let closing = false;
let listener!: Listener;

export async function* open(addr: string): AsyncGenerator<Request> {
  const opts: Deno.ListenOptions = { port: 0 };
  let info: string[];
  [opts.hostname] = info = addr.split(":");
  opts.port = Number(info[1]);

  listener = listen(opts);

  const mux = new MuxAsyncIterator<Request>();
  mux.add(connectAndIter(mux));
  return mux.iterate();
}

export function close() {
  closing = true;
  listener.close();
  for (const conn of connections) {
    try {
      conn.close();
    } catch (err) {
      // Connection might have been already closed
      if (!(err instanceof Deno.errors.BadResource)) throw e;
    }
  }
}

async function* connectAndIter(mux: MuxAsyncIterator<Request>) {
  if (closing) return;
  let conn: Conn;
  try {
    conn = await listener.accept();
  } catch (err) {
    if (!(err instanceof Deno.errors.BadResource)) throw e;
  }

  connections.add(conn);
  mux.add(connectAndIter(mux));
  yield* iterRequests(conn);
}

async function* iterRequests(conn: Conn) {
  while (!closing) {
    const headers = parseHeaders(conn, {
      compressed: false,
      compressionThreshold: -1,
      encrypted: false,
    });
    yield new Request(conn);
  }
}
