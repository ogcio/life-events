import fastify, { FastifyServerOptions } from "fastify";
import routes from "./routes/index.js";
import fastifyEnv from "@fastify/env";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { envSchema } from "./config.js";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import sensible from "@fastify/sensible";
import { initializeLoggingHooks } from "logging-wrapper";
import { initializeErrorHandler } from "error-handler";
import postgres from "@fastify/postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();
  initializeLoggingHooks(app);
  initializeErrorHandler(app);

  await app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "OGCIO AuthService",
        description: "API for OGCIO AuthService",
        version: "0.1.0",
      },
      tags: [
        {
          name: "AuthService",
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
    host: app.config.POSTGRES_HOST,
    port: Number(app.config.POSTGRES_PORT),
    user: app.config.POSTGRES_USER,
    password: app.config.POSTGRES_PASSWORD,
    database: app.config.POSTGRES_DB_NAME_SHARED,
  });

  app.register(import("@fastify/cookie"), {
    hook: "onRequest", // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: {}, // options for parsing cookies
  });

  app.register(import("@fastify/formbody"));

  app.register(routes);

  app.register(sensible);

  return app;
}
