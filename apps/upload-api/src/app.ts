import fastify, { FastifyServerOptions } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastifyEnv from "@fastify/env";
import sensible from "@fastify/sensible";
// import postgres from "@fastify/postgres";
import multipart from "@fastify/multipart";
import autoload from "@fastify/autoload";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { initializeLoggingHooks } from "logging-wrapper";
import { initializeErrorHandler } from "error-handler";
import apiAuthPlugin from "api-auth";

import routes from "./routes/index.js";
import { envSchema } from "./config.js";

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

  app.register(apiAuthPlugin, {
    jwkEndpoint: process.env.LOGTO_JWK_ENDPOINT as string,
    oidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT as string,
    currentApiResourceIndicator: process.env
      .LOGTO_API_RESOURCE_INDICATOR as string,
  });

  app.register(multipart, {
    limits: {
      fileSize: app.config.MAX_FILE_SIZE as number,
    },
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "OGCIO File Upload API",
        description: "API for OGCIO file upload service",
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

  // app.register(postgres, {
  //   host: app.config.POSTGRES_HOST,
  //   port: Number(app.config.POSTGRES_PORT),
  //   user: app.config.POSTGRES_USER,
  //   password: app.config.POSTGRES_PASSWORD,
  //   database: app.config.POSTGRES_DB_NAME_SHARED,
  // });

  app.register(import("@fastify/cookie"), {
    hook: "onRequest", // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: {}, // options for parsing cookies
  });

  await app.register(autoload, {
    dir: join(__dirname, "plugins"),
  });
  app.register(import("@fastify/formbody"));

  app.register(routes, { prefix: "/api/v1" });

  app.register(sensible);

  return app;
}
