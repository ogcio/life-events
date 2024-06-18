import Fastify from "fastify";
import path from "path";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import fastifyPostgres from "@fastify/postgres";
import autoload from "@fastify/autoload";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envSchema = {
  type: "object",
  properties: {
    POSTGRES_HOST: { type: "string" },
    POSTGRES_PORT: { type: "string" },
    POSTGRES_USER: { type: "string" },
    POSTGRES_PASSWORD: { type: "string" },
    POSTGRES_DB: { type: "string" },
    POSTGRES_DB_NAME_SHARED: { type: "string" },
    ORIGIN_URL: { type: "string" },
    AUTH_SERVICE_CALLBACK_URL: { type: "string" },
  },
  required: [
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB_NAME_SHARED",
    "ORIGIN_URL",
    "AUTH_SERVICE_CALLBACK_URL",
  ],
};

const fastify = Fastify({
  logger: true,
});

await fastify.register(fastifyEnv, {
  schema: envSchema,
  dotenv: true,
  data: process.env,
});

await fastify.register(fastifyPostgres, {
  host: fastify.config.POSTGRES_HOST,
  port: fastify.config.POSTGRES_PORT,
  user: fastify.config.POSTGRES_USER,
  password: fastify.config.POSTGRES_PASSWORD,
  database: fastify.config.POSTGRES_DB_NAME_SHARED,
});

await fastify.register(import("@fastify/formbody"));

fastify.get("/health", async function handler() {
  return { ping: "pong" };
});

fastify.register(import("@fastify/static"), {
  root: path.join(__dirname, "stubs"),
  prefix: "/static/",
  index: "index.html",
  list: false,
  constraints: {},
});

fastify.register(autoload, {
  dir: path.join(__dirname, "stubs"),
  options: {
    prefix: "/static",
  },
});

await fastify.register(cors, {
  origin: fastify.config.ORIGIN_URL,
});

try {
  await fastify.listen({ host: "0.0.0.0", port: 8000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
