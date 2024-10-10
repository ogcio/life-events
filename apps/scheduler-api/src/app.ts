import fastifyEnv from "@fastify/env";
import postgres from "@fastify/postgres";
import sensible, { httpErrors } from "@fastify/sensible";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { initializeErrorHandler } from "@ogcio/fastify-error-handler";
import fastify, { FastifyServerOptions } from "fastify";
import fs from "fs";
import { initializeLoggingHooks } from "@ogcio/fastify-logging-wrapper";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { envSchema } from "./config.js";
import healthCheck from "./routes/healthcheck.js";
import routes from "./routes/index.js";
import v8 from "v8";

import fastifySwagger from "@fastify/swagger";
import fastifyUnderPressure from "@fastify/under-pressure";
import apiAuthPlugin from "api-auth";

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

  app.register(apiAuthPlugin, {
    jwkEndpoint: app.config.LOGTO_JWK_ENDPOINT as string,
    oidcEndpoint: app.config.LOGTO_OIDC_ENDPOINT as string,
    currentApiResourceIndicator: app.config
      .LOGTO_API_RESOURCE_INDICATOR as string,
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
      throw httpErrors.serviceUnavailable(
        `System is under pressure. Pressure type: ${type}. Pressure value: ${value}`,
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
