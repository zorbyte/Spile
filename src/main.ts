import { SPILE_VERSION, SPILE_GITHUB_URL } from "@etc/package.ts";

import { createLogger, setDefaultName } from "@utils/logger.ts";

import { listen } from "./protocol/server.ts";

setDefaultName("master");

const log = createLogger();

log.info(`Welcome to Spile version v${SPILE_VERSION} written by zorbyte`);
log.info(
  `Please consider starring this project on Github at ${SPILE_GITHUB_URL}`,
);

listen({ hostname: "127.0.0.1", port: 25565 });
