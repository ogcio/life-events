import fastify, { FastifyServerOptions } from "fastify";
import healthCheck from "./routes/healthcheck";
import configPlugin from "./plugins/config";
import databasePlugin from "./plugins/database";

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts);

  app.register(healthCheck);
  app.register(configPlugin);
  app.register(databasePlugin);

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
