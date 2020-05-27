import { createLogger, setDefaultName } from "./utils/logger.ts";
// import { version } from "../etc/version.ts";

setDefaultName("master");

const log = createLogger();

log.error("bruh");
