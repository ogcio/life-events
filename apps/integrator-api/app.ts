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
import apiAuthPlugin, { verifyJWT } from "api-auth";
import { initializeErrorHandler } from "error-handler";
import { initializeLoggingHooks } from "logging-wrapper";
import healthCheck from "./src/routes/healthcheck";
import journey from "./src/plugins/entities/journey/index.js";
import journeyStepConnections from "./src/plugins/entities/journeyStepConnections";
import journeySteps from "./src/plugins/entities/journeySteps";
import run from "./src/plugins/entities/run";

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

  // Test callback route to test communication between systems
  app.get("/callback", async (request, reply) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { token } = request.query as any;

    if (!token) {
      return reply.code(400).send({ error: "Token not provided" });
    }

    // We need to store this somehow in an env variable
    const jwksRegistry = {
      payments: "http://localhost:8001/.well-known/jwks.json",
    };

    try {
      // How to understand what jwks to use? - Most probably by looking at the step id
      const jwksUrl = jwksRegistry.payments;
      const payload = await verifyJWT(token, {
        jwksUrl,
        issuer: "payments-api",
        audience: "integrator-api",
      });

      // Send back the payload if the JWT verification is successful
      return reply.code(200).send({ status: "success", payload });
    } catch (err) {
      return reply
        .code(401)
        .send({ status: "error", message: "Invalid token" });
    }
  });

  app.register(sensible);

  app.register(journey);
  app.register(journeyStepConnections);
  app.register(journeySteps);
  app.register(run);

  return app;
}
