import { getClientLogger as clientLogger } from "./client-logger.js";
import { getServerLogger as serverLogger } from "./server-logger.js";

export const getServerLogger = serverLogger;
export const getClientLogger = clientLogger;
