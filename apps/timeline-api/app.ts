import fastify, { FastifyServerOptions } from "fastify";
import routes from "./routes";
import fastifyEnv from "@fastify/env";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import dotenv from "dotenv";
import { envSchema } from "./config";
import authPlugin from "./plugins/auth";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import healthCheck from "./routes/healthcheck";
import sensible from "@fastify/sensible";
import postgres from "@fastify/postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

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

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    if (error instanceof Error && error.name !== "error") {
      reply
        .code(error.statusCode || 500)
        .type("application/json")
        .send({
          message: error.message,
          error,
          code: error.code || "INTERNAL_SERVER_ERROR",
          statusCode: error.statusCode || 500,
          time: new Date().toISOString(),
        });
      return;
    }

    reply.code(500).type("application/json").send({
      message: error.message,
      error: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      time: new Date().toISOString(),
    });
  });

  app.register(healthCheck);

  app.register(routes, { prefix: "/api/v1" });

  app.register(sensible);

  return app;
}
