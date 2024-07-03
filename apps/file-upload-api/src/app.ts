import fastify, { FastifyServerOptions } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastifyEnv from "@fastify/env";
import sensible from "@fastify/sensible";
import postgres from "@fastify/postgres";
import multipart from "@fastify/multipart";
import autoload from "@fastify/autoload";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializeLoggingHooks } from "logging-wrapper";
import { initializeErrorHandler } from "error-handler";

import routes from "./routes/index.js";
import { envSchema } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();
  initializeLoggingHooks(app);
  initializeErrorHandler(app);

  // limit 20 gb file
  app.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024 * 1024,
    },
  });

  await app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "OGCIO File Upload API",
        description: "API for OGCIO file upload servce",
        version: "0.1.0",
      },
      tags: [
        {
          name: "FileUploadApi",
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

  await app.register(autoload, {
    dir: join(__dirname, "plugins"),
  });
  app.register(import("@fastify/formbody"));

  app.register(routes);

  app.register(sensible);

  return app;
}
