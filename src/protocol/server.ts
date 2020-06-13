import { createLogger } from "@utils/logger.ts";
import { SError } from "@utils/errors/mod.ts";

import { Collator } from "./collator.ts";
import { Consumer } from "./consumer.ts";
import { Context, State } from "./context.ts";
import { getPacketCodec } from "./get_packet_codec.ts";
import {
  decodeHeaders,
  encodeHeaders,
  concatArrays,
  ProtocolHeaders,
} from "./io_utils.ts";

import Listener = Deno.Listener;
import Conn = Deno.Conn;

interface Client {
  state: State;
  close(shouldThrow?: boolean): void;
}

const log = createLogger("protocol");
const clients = new Set<Client>();
let listener: Listener;
let serverOpen = false;

const HEADER_OPTS_STUB = {
  encrypted: false,
  compressed: false,
  compressionThreshold: -1,
};

interface ServeOptions {
  hostname: string;
  port: number;
}

export function listen(opts: ServeOptions) {
  listener = Deno.listen(opts);
  serverOpen = true;

  acceptConnections();
  log.info(`Started listening on ${opts.hostname}:${opts.port}`);
}

export function close() {
  serverOpen = false;
  listener?.close();
  for (const client of clients) {
    try {
      client.close();
    } catch (err) {
      if (!isConnClosedErr(err)) throw err;
    }
  }
}

async function acceptConnections() {
  // Do not await handleConnection, otherwise each connection would block the entire program.
  for await (const conn of listener) handleConnection(conn);
}

async function handleConnection(conn: Conn) {
  let closeOnEnd = false;
  let connClosed = false;
  const cons = new Consumer(conn);
  const client: Client = {
    state: State.HANDSHAKE,
    close(shouldThrow = true) {
      closeOnEnd = false;
      connClosed = true;
      cons.empty();

      try {
        conn.close();
      } catch (err) {
        // The connection might have been already closed.
        if (!(err instanceof Deno.errors.BadResource)) throw err;
        if (shouldThrow) throw new SError("CONNECTION_CLOSED");
      }

      clients.delete(client);
    },
  };

  clients.add(client);

  while (serverOpen && !connClosed) {
    try {
      const [nextByte] = await cons.peak(1);
      if (nextByte === 0xFE) {
        // TODO: Implement legacy ping.
        log.debug("Ignoring legacy ping");
        break;
      }

      // This little hack with the consumer history allows us to get super fast ping times.
      // This might be rethought in future, even though the performance penalty is minimal,
      // this still operates to the detriment of other packets.
      cons.recordHistory();
      const headerData = await decodeHeaders(cons, HEADER_OPTS_STUB);
      const { history, length } = cons.getHistory();
      cons.recordHistory(false);
      if (headerData.id === 0x01 && client.state === State.STATUS) {
        log.debug("Handling ping packet dirtily");

        // 8 bytes is the same amount of bytes used to encode a IEEE-754 Double.
        // See https://wiki.vg/Server_List_Ping.
        const remainder = await cons.read(8);
        const res = concatArrays(
          [...history, remainder],
          length + remainder.length,
        );

        await conn.write(res);
        break;
      }

      const packetCodec = getPacketCodec(headerData.id, "I", client.state);
      if (!packetCodec) break;

      const packet = await packetCodec.decode(cons, headerData);
      const ctx = new Context(packet, client.state);

      ctx.log.debug("Incoming packet with headers:", headerData);

      let resPacket: ProtocolHeaders | undefined | void;
      try {
        resPacket = await packetCodec?.runHook?.(ctx);
      } finally {
        // If the state changed in the context, the client should reflect that.
        client.state = ctx.state;
        closeOnEnd = ctx.closeOnEnd;
      }

      if (!resPacket) continue;

      const resPacketCodec = getPacketCodec(resPacket.id, "O", client.state);
      if (!resPacketCodec) {
        throw new Error(
          "Tried to send back a packet that doesn't have a codec",
        );
      }

      const col = new Collator();
      await resPacketCodec.encode(col, resPacket);
      await encodeHeaders(col, packet.id, HEADER_OPTS_STUB);

      const resBytes = col.concat();
      if (!resBytes) {
        throw new Error(
          "An error occurred while concatenating the bytes of a response",
        );
      }

      await conn.write(resBytes);
    } catch (err) {
      if (!isConnClosedErr(err)) {
        log.error("Request failed:");
        log.error(err);
        client.close(false);
      }
    } finally {
      if (closeOnEnd) {
        client.close(false);
      } else if (!connClosed) {
        cons.empty();
        continue;
      }

      break;
    }
  }

  // This is just a precaution, connections should not be left idling in the background.
  client.close(false);
  log.debug("Closed connection");
}

function isConnClosedErr(err: any) {
  return (err as InstanceType<typeof SError>).code === "CONNECTION_CLOSED";
}
