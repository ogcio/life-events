import pinoLogger, { Logger } from "pino";

let logger: Logger;
export const getLogger = () => {
  if (!logger) {
    const deploymentEnv = process.env.NODE_ENV || "development";
    logger = pinoLogger({
      level: deploymentEnv === "production" ? "info" : "debug",
    });
  }
  return logger;
};

export const getRequestId = (headers: Headers) => {
  let correlationId = headers.get("x-request-id");
  if (!correlationId) {
    correlationId = crypto.randomUUID();
  }
  return correlationId;
};
