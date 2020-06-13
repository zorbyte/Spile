import { SPILE_VERSION } from "@etc/package.ts";

import { createLogger, setDefaultName } from "@utils/logger.ts";

import { listen } from "./protocol/server.ts";

setDefaultName("master");

const log = createLogger();

log.info(`Starting Spile v${SPILE_VERSION}`);

listen({ hostname: "127.0.0.1", port: 25565 });
