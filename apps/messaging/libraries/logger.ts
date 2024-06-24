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

export const getCorrelationId = (headers: Headers) => {
  let correlationId = headers.get("x-correlation-id");
  if (!correlationId) {
    correlationId = crypto.randomUUID();
  }
  return correlationId;
};
