import { createLogger, setDefaultName } from "./utils/logger.ts";
import { serve } from "./proto/server.ts";
// import { version } from "../etc/version.ts";

setDefaultName("master");

const log = createLogger();

log.error("bruh");

await serve(":8080");
log.info("Bruy");
