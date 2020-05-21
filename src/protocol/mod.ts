// Inspired by deno/std/http.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { BufReader, BufWriter } from "https://deno.land/std@0.52.0/io/mod.ts";
import {
  MuxAsyncIterator,
  deferred,
} from "https://deno.land/std@0.52.0/async/mod.ts";

import Conn = Deno.Conn;
import Listener = Deno.Listener;

const { listen } = Deno;

class Request {
  done = deferred<Error | void>();
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
    } catch (e) {
      // Connection might have been already closed
      if (!(e instanceof Deno.errors.BadResource)) throw e;
    }
  }
}

async function* connectAndIter(mux: MuxAsyncIterator<Request>) {
  if (closing) return;
  let conn: Conn;
  try {
    conn = await listener.accept();
  } catch (error) {
    if (error instanceof Deno.errors.BadResource) return;
    throw error;
  }

  connections.add(conn);
  mux.add(connectAndIter(mux));
  yield* iterRequests(conn);
}

async function* iterRequests(conn: Conn) {
  const reader = new BufReader(conn);
  const writer = new BufWriter(conn);

  while (!closing) {}

  yield new Request();
}
