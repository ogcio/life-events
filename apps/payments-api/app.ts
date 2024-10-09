import fastify, { FastifyServerOptions } from "fastify";
import routes from "./routes";
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
import healthCheck from "./routes/healthcheck";
import sensible from "@fastify/sensible";
import schemaValidators from "./routes/schemas/validations";
import apiAuthPlugin, {
  readOrGenerateKeyPair,
  createSignedJWT,
  getJWKSRoute,
} from "api-auth";
import { initializeErrorHandler } from "@ogcio/fastify-error-handler";
import { initializeLoggingHooks } from "@ogcio/fastify-logging-wrapper";
import providers from "./plugins/entities/providers";
import citizen from "./plugins/entities/citizen";
import transactions from "./plugins/entities/transactions";
import paymentRequest from "./plugins/entities/paymentRequest";
import auditLog from "./plugins/auditLog";
import rawbody from "fastify-raw-body";

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

  await app.register(rawbody, {
    field: "rawBody", // change the default request.rawBody property name
    global: false, // add the rawBody to every request. **Default true**
    encoding: "utf8", // set it to false to set rawBody as a Buffer **Default utf8**
    runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
    routes: [], // array of routes, **`global`** will be ignored, wildcard routes not supported
    jsonContentTypes: [], // array of content-types to handle as JSON. **Default ['application/json']**
  });

  app.register(healthCheck);

  app.register(auditLog);

  app.register(routes, { prefix: "/api/v1" });

  app.register(sensible);

  app.register(providers);
  app.register(citizen);
  app.register(transactions);
  app.register(paymentRequest);

  // This route exposes the Public keys
  app.get("/.well-known/jwks.json", async () => {
    // const publicKey = await readLocalPublicKey(join(__dirname, "public.key"));
    const { publicKey } = await readOrGenerateKeyPair("payments-api");
    return getJWKSRoute(publicKey);
  });

  // This is a test route that calls the integrator with a callback
  app.get("/call-integrator", async () => {
    // const privateKey = await readLocalPrivateKey(
    //   join(__dirname, "private.key"),
    // );
    const { privateKey } = await readOrGenerateKeyPair("payments-api");

    const jwt = await createSignedJWT(
      {
        user: "tony-stark",
        paymentStatus: "done",
        transactionId: "1234",
      },
      privateKey,
      {
        audience: "integrator-api",
        issuer: "payments-api",
      },
    );
    const endpoint = `http://localhost:8009/callback?token=${encodeURIComponent(jwt)}`;

    // Do you want to try it yourself in the browser?
    console.log("TRY IT OUT: ", endpoint);

    // Make the fetch request
    const response = await fetch(endpoint);
    const data = await response.json();
    return { data };
  });

  return app;
}
