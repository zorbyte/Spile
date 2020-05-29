import { createLogger, setDefaultName } from "./utils/logger.ts";
import { serve } from "./proto/server.ts";
import { SPILE_VERSION, SPILE_GITHUB_URL } from "../etc/package.ts";

setDefaultName("master");

const log = createLogger();

log.info(`Welcome to Spile version v${SPILE_VERSION} written by zorbyte`);
log.info(`Please consider starring this project on Github at ${SPILE_GITHUB_URL}`);

await serve(":8080");
