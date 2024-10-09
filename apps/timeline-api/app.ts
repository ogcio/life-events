import fastify, { FastifyServerOptions } from "fastify";
import routes from "./routes/index.js";
import fastifyEnv from "@fastify/env";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import dotenv from "dotenv";
import { envSchema } from "./config.js";
import authPlugin from "./plugins/auth.js";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import healthCheck from "./routes/healthcheck.js";
import sensible from "@fastify/sensible";
import postgres from "@fastify/postgres";
import { initializeLoggingHooks } from "@ogcio/fastify-logging-wrapper";
import { initializeErrorHandler } from "@ogcio/fastify-error-handler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();
  initializeLoggingHooks(app);
  initializeErrorHandler(app);

  app.register(authPlugin);
  app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "OGCIO Timeline API",
        description: "API for OGCIO Timeline Service",
        version: "0.1.0",
      },
      tags: [
        {
          name: "Timeline",
        },
      ],
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

  app.register(healthCheck);

  app.register(routes, { prefix: "/api/v1" });

  app.register(sensible);

  return app;
}
