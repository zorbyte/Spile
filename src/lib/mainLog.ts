import Logger, { LoggerLevels } from "@utils/Logger";
import { isDebug } from "@utils/utils";

// Make it easier for other modules to use the logger without actually naming it log.
export const mainLog = new Logger("master", isDebug ? LoggerLevels.DEBUG : LoggerLevels.INFO);
