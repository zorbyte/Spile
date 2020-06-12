import { createLogger } from "@utils/logger.ts";

import { Context } from "./context.ts";
import { getPacketCodec } from "./get_packet_codec.ts";
import { parseHeaders, collator } from "./io_utils.ts";
import { Client } from "./client.ts";

import Listener = Deno.Listener;
import Conn = Deno.Conn;
import { kSpileError, SError } from "../utils/errors/mod.ts";

const { listen: listenTcp } = Deno;

const log = createLogger("protocol");
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
  const client = new Client(conn, log);

  while (open && !client.closed) {
    try {
      const [nextByte] = await client.consumer.peak(1);
      if (nextByte === 0xFE) {
        // TODO: Implement legacy ping.
        client.log.debug("Ignoring legacy ping");
        client.consumer.end();
        continue;
      }

      const headerData = await parseHeaders(client.consumer, {
        encrypted: false,
        compressed: false,
        compressionThreshold: -1,
      });

      if (!headerData) continue;

      const { id } = headerData;

      const packetCodec = getPacketCodec(id, client.state);
      if (!packetCodec) continue;

      const packet = await packetCodec.decode(client.consumer, headerData);
      const ctx = new Context(client, packet);

      client.log.debug("Incoming request with headers:", headerData);

      const resPacket = await packetCodec?.runHook?.(ctx);
      if (!resPacket) continue;

      const resPacketCodec = getPacketCodec(resPacket.id, client.state);
      if (!resPacketCodec) {
        throw new Error(
          "Tried to send back a packet that doesn't have a codec",
        );
      }

      const insert = collator();
      await resPacketCodec.encode(insert, resPacket);

      const resBytes = insert();
      await conn.write(resBytes);
    } catch (err) {
      if (
        !!err?.[kSpileError] &&
        (err as InstanceType<typeof SError>).code === "CONNECTION_CLOSED"
      ) {
        continue;
      }

      client.log.error("Request failed:");
      client.log.error(err);
    } finally {
      client.consumer.end();
    }
  }
}

export function listen(opts: ServeOptions) {
  listener = listenTcp(opts);
  open = true;

  acceptConnections();
  log.info(`Started listening on ${opts.hostname}:${opts.port}`);
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
