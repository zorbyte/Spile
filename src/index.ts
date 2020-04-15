import Logger from "./internals/cli/Logger";
import Environment from "./Environment";

const log = new Logger(Math.min(Environment.debugSig, Environment.devSig, 1));

const { dev } = Environment.get();

// Implicit debug.
log.debug(`Starting server in ${dev ? "development" : "debug"} mode.`);
log.info("Starting the Netherite Minecraft Server.");
log.start("Starting server...");

// log.debug("Version Metadata not found, skipping update check!");

log.warn("Offline mode is enabled, Yggdrasil will not be used for Authentication.");
log.error(new Error("Something?"));

setTimeout(() => log.stop.startREPL(), 3000);

// cluster.fork();

// Setup routine, minecraft runs at 50Hz or 20ms per tick.
// If the Δt <= 1ms.
