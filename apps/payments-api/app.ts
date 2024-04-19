import fastify, { FastifyServerOptions } from "fastify";
import routes from "./routes";
import fastifyEnv from "@fastify/env";
import postgres from "@fastify/postgres";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import dotenv from "dotenv";
import { envSchema } from "./config";
import authPlugin from "./plugins/auth";
import logtoAuthPlugin from "./plugins/logtoAuth";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import healthCheck from "./routes/healthcheck";
import sensible from "@fastify/sensible";
import schemaValidators from "./routes/schemas/validations";
import { STATUS_CODES } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

  app.setValidatorCompiler(({ schema }) => {
    return schemaValidators(schema);
  });

  app.register(authPlugin);
  app.register(logtoAuthPlugin);
  app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "OGCIO Payment API",
        description: "API for OGCIO Payment Service",
        version: "0.1.0",
      },
      tags: [
        {
          name: "Providers",
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

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    if (
      error instanceof Error &&
      (error.name !== "error" || !!error.validation)
    ) {
      reply.status(error.statusCode || 500).send({
        error: STATUS_CODES[error.statusCode || 500],
        message: error.message,
        name: error.name,
        validation: error.validation,
        validationContext: error.validationContext,
        statusCode: error.statusCode || 500,
      });
      return;
    }
    reply.code(500).type("application/json").send({ error });
  });

  return app;
}
