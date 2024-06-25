import { getClientLogger as clientLogger } from "./client-logger.js";
import { getServerLogger } from "./server-logger.js";

export const getLogger = getServerLogger;
export const getClientLogger = clientLogger;
