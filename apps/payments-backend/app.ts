import fastify, { FastifyServerOptions } from "fastify";
import healthCheck from "./routes/healthcheck";
import databasePlugin from "./plugins/database";
import fastifyEnv from "@fastify/env";
import dotenv from "dotenv";
import { envSchema } from "./config";
dotenv.config();

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts);

  app.register(healthCheck);
  app.register(databasePlugin);

  app.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
  });

  app.get("/", async (request, reply) => {
    const result = await app.pgpool.query("SELECT * FROM users");
    console.log(result.rows);
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
