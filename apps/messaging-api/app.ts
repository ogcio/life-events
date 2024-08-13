import fastify, { FastifyServerOptions } from "fastify";
import routes from "./routes";
import fastifyEnv from "@fastify/env";
import postgres from "@fastify/postgres";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import dotenv from "dotenv";
import { envSchema } from "./config";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyUnderPressure from "@fastify/under-pressure";
import fs from "fs";
import apiAuthPlugin from "api-auth";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import healthCheck from "./routes/healthcheck";
import { initializeErrorHandler } from "error-handler";
import { initializeLoggingHooks } from "logging-wrapper";
import fastifyMultipart from "@fastify/multipart";
import v8 from "v8";
import { CustomError } from "shared-errors";
import { version } from "./package.json";

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
        version,
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    transformSpecificationClone: true,
    transformSpecification(swaggerObject) {
      // thanks to this we can avoid to remove endpoints
      // from the open api definition so to be able to use them
      // in the SDKs but at the same time hide them
      // in the Swagger UI
      delete swaggerObject.paths["/api/v1/user-imports/template-download"];
      return swaggerObject;
    },
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

  return app;
}
