import { createLogger } from "@utils/logger.ts";
import { SError } from "@utils/errors/mod.ts";

import { Context } from "./context.ts";
import { Collator } from "./collator.ts";
import { getPacketCodec } from "./get_packet_codec.ts";
import { decodeHeaders, encodeHeaders, concatArrays } from "./io_utils.ts";
import { Client, State } from "./client.ts";

import Listener = Deno.Listener;
import Conn = Deno.Conn;

const log = createLogger("protocol");
const clients = new Set<Client>();
let listener: Listener;
let open = false;

const HEADER_OPTS_STUB = {
  encrypted: false,
  compressed: false,
  compressionThreshold: -1,
};

interface ServeOptions {
  hostname: string;
  port: number;
}

async function acceptConnections() {
  // Do not await handleConnection, otherwise each connection would block the entire program.
  for await (const conn of listener) handleConnection(conn);
}

async function handleConnection(conn: Conn) {
  const client = new Client(conn, log);
  clients.add(client);

  while (open && !client.closed) {
    try {
      const [nextByte] = await client.consumer.peak(1);
      if (nextByte === 0xFE) {
        // TODO: Implement legacy ping.
        client.log.debug("Ignoring legacy ping");
        client.close(true);
        break;
      }

      // This little hack with the consumer history allows us to get super fast ping times.
      // This might be rethought in future, even though the performance penalty is minimal,
      // this still operates to the detriment of other packets.
      client.consumer.recordHistory();
      const headerData = await decodeHeaders(client.consumer, HEADER_OPTS_STUB);
      const { history, length } = client.consumer.getHistory();
      client.consumer.recordHistory(false);
      if (headerData.id === 0x01 && client.state === State.STATUS) {
        log.debug("Handling ping packet dirtily");

        // 8 bytes is the same amount of bytes used to encode a IEEE-754 Double.
        // See https://wiki.vg/Server_List_Ping.
        const remainder = await client.consumer.read(8);
        const res = concatArrays(
          [...history, remainder],
          length + remainder.length,
        );

        await conn.write(res);
        client.close(true);
        break;
      }

      const packetCodec = getPacketCodec(headerData.id, "I", client.state);
      if (!packetCodec) break;

      const packet = await packetCodec.decode(client.consumer, headerData);
      const ctx = new Context(client, packet);

      ctx.log.debug("Incoming packet with headers:", headerData);

      const resPacket = await packetCodec?.runHook?.(ctx);
      if (!resPacket) continue;

      const resPacketCodec = getPacketCodec(resPacket.id, "O", client.state);
      if (!resPacketCodec) {
        throw new Error(
          "Tried to send back a packet that doesn't have a codec",
        );
      }

      const col = new Collator();
      await resPacketCodec.encode(col, resPacket);
      await encodeHeaders(col, HEADER_OPTS_STUB);

      const resBytes = col.concat();
      if (!resBytes) {
        throw new Error(
          "An error occurred while concatenating the bytes of a response",
        );
      }

      await conn.write(resBytes);
    } catch (err) {
      if (
        (err as InstanceType<typeof SError>).code !== "CONNECTION_CLOSED"
      ) {
        client.log.error("Request failed:");
        client.log.error(err);
        client.close();
      } else {
        break;
      }
    } finally {
      if (client.shouldClose) {
        client.close(true);
      } else if (!client.closed) {
        client.consumer.empty();
        continue;
      }

      break;
    }
  }

  client.log.debug("Closed connection");
  clients.delete(client);
}

export function listen(opts: ServeOptions) {
  listener = Deno.listen(opts);
  open = true;

  acceptConnections();
  log.info(`Started listening on ${opts.hostname}:${opts.port}`);
}

export function close() {
  open = false;
  listener?.close();
  for (const client of clients) {
    try {
      client.close(true);
    } catch (err) {
      // Connection might have been already closed.
      if (!(err instanceof Deno.errors.BadResource)) throw err;
    }
  }
}
