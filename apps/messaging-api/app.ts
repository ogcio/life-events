import fastify, { FastifyServerOptions } from "fastify";
import routes from "./routes";
import fastifyEnv from "@fastify/env";
import postgres from "@fastify/postgres";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import dotenv from "dotenv";
import { envSchema } from "./config";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fs from "fs";
import apiAuthPlugin from "api-auth";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import healthCheck from "./routes/healthcheck";
import sensible from "@fastify/sensible";
import { initializeErrorHandler } from "error-handler";
import { initializeLoggingHooks } from "logging-wrapper";
import fastifyMultipart from "@fastify/multipart";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();
  initializeLoggingHooks(app);
  initializeErrorHandler(app);

  app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "OGCIO Messaging API",
        description: "API for OGCIO Messaging Service",
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

  app.register(postgres, {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB_NAME,
  });

  app.register(apiAuthPlugin, {
    jwkEndpoint: process.env.LOGTO_JWK_ENDPOINT as string,
    oidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT as string,
    currentApiResourceIndicator: process.env
      .LOGTO_API_RESOURCE_INDICATOR as string,
  });

  app.register(fastifyMultipart);

  app.register(healthCheck);

  app.register(routes, { prefix: "/api/v1" });

  app.register(sensible, {
    sharedSchemaId: "HttpError",
  });

  return app;
}
