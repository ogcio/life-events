import fastify, { FastifyServerOptions } from "fastify";
import routes from "./src/routes";
import fastifyEnv from "@fastify/env";
import fastifyFormBody from "@fastify/formbody";
import postgres from "@fastify/postgres";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import dotenv from "dotenv";
import { envSchema } from "./config";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import sensible from "@fastify/sensible";
import schemaValidators from "./src/routes/schemas/validations";
import apiAuthPlugin from "api-auth";
import { initializeErrorHandler } from "error-handler";
import { initializeLoggingHooks } from "logging-wrapper";
import healthCheck from "./src/routes/healthcheck";
import journey from "./src/plugins/entities/journey/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();
  initializeLoggingHooks(app);
  initializeErrorHandler(app);

  app.setValidatorCompiler(({ schema }) => {
    return schemaValidators(schema);
  });

  app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  app.register(apiAuthPlugin, {
    jwkEndpoint: process.env.LOGTO_JWK_ENDPOINT as string,
    oidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT as string,
    currentApiResourceIndicator: process.env
      .LOGTO_API_RESOURCE_INDICATOR as string,
  });

  app.register(fastifyFormBody);

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "OGCIO Integrator API",
        description: "API for OGCIO Integrator Service",
        version: "0.1.0",
      },
      tags: [
        {
          name: "Integrator",
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

  app.register(journey);

  return app;
}
