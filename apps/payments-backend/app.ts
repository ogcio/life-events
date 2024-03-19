import fastify, { FastifyServerOptions } from "fastify";
import healthCheck from "./routes/healthcheck";
import fastifyEnv from "@fastify/env";
import postgres from "@fastify/postgres";
import dotenv from "dotenv";
import { envSchema } from "./config";
dotenv.config();

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts);

  app.register(healthCheck);

  app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  app.register(postgres, {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB_NAME,
  });

  app.get("/", async (request, reply) => {
    return { hello: "world" };
  });

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    reply
      .code(500)
      .type("application/json")
      .send({ message: "Something went wrong" });
  });

  return app;
}
