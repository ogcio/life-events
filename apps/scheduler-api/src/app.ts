import fastifyEnv from "@fastify/env";
import postgres from "@fastify/postgres";
import sensible from "@fastify/sensible";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { initializeErrorHandler } from "error-handler";
import fastify, { FastifyServerOptions } from "fastify";
import fs from "fs";
import { initializeLoggingHooks } from "logging-wrapper";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { envSchema } from "./config.js";
import healthCheck from "./routes/healthcheck.js";
import routes from "./routes/index.js";
import v8 from "v8";

import fastifySwagger from "@fastify/swagger";
import fastifyUnderPressure from "@fastify/under-pressure";
import { CustomError } from "shared-errors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

  initializeErrorHandler(app);
  initializeLoggingHooks(app);

  await app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "OGCIO Scheduler API",
        description: "API for OGCIO Scheduler",
        version: "0.1.0",
      },
    },
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    logo: {
      type: "image/png",
      content: Buffer.from(
        fs.readFileSync(join(__dirname, "logo.png")).toString("base64"),
        "base64",
      ),
    },
  });

  app.register(fastifyUnderPressure, {
    maxEventLoopDelay: 1000,
    maxHeapUsedBytes: v8.getHeapStatistics().heap_size_limit,
    maxRssBytes: v8.getHeapStatistics().total_available_size,
    maxEventLoopUtilization: 0.98,
    pressureHandler: (_req, _rep, type, value) => {
      const pressureError = "UNDER_PRESSURE_ERROR";
      throw new CustomError(
        pressureError,
        `System is under pressure. Pressure type: ${type}. Pressure value: ${value}`,
        503,
        pressureError,
      );
    },
  });

  app.register(postgres, {
    host: app.config.POSTGRES_HOST as string,
    port: Number(app.config.POSTGRES_PORT),
    user: app.config.POSTGRES_USER as string,
    password: app.config.POSTGRES_PASSWORD as string,
    database: app.config.POSTGRES_DB_NAME as string,
  });

  app.register(healthCheck);

  app.register(routes, { prefix: "/api/v1" });

  app.register(sensible);

  return app;
}
