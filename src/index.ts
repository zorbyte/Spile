import Logger from "./internals/cli/Logger";
import Environment from "./modules/Environment";
import createServer from "./internals/server/createServer";
// import { join } from "path";
import { generateKeyPair } from "crypto";
// import { Worker, SHARE_ENV } from "worker_threads";

const log = new Logger("Master", Math.min(Environment.debugSig, Environment.devSig, 1));

const { dev } = Environment.get();

(async () => {
  // Implicit debug.
  log.debug(`Starting server in ${dev ? "development" : "debug"} mode.`);
  log.info("Starting the Spile Minecraft Server.");
  log.start("Generating keypair...");

  // @ts-ignore
  const _key = await new Promise((resolve, reject) => generateKeyPair("rsa", {
    modulusLength: 1024,
    publicKeyEncoding: {
      type: "spki",
      format: "der",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "SpileForTheBoys???",
    },
  }, (err, publicKey, _privateKey) => {
    if (err) return reject(err);
    log.info("Successfully generated keypair.");
    resolve(publicKey);
  }));

  // log.debug("Version Metadata not found, skipping update check!");

  log.warn("Offline mode is enabled, Yggdrasil will not be used for Authentication.");

  log.update("Opening server...");
  await createServer(log);
  log.info("Successfully opened server on port 25565.");

  log.stop.startREPL();

  log.info("Spawning in game tick worker.");

  // @ts-ignore
  // const worker = new Worker(join(__dirname, "internals", "game", "gameLoop.js"), { env: SHARE_ENV, stdout: true, workerData: { fd: process.stdout.fd } });

  // cluster.fork();

  // Setup routine, minecraft runs at 50Hz or 20ms per tick.
  // If the Δt <= 1ms.
})();
