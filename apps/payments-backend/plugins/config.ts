import { FastifyPluginCallback } from "fastify";
import fastifyEnv from "@fastify/env";

const databasePlugin: FastifyPluginCallback = (fastify, options, done) => {
  fastify.register(fastifyEnv, {
    schema: {
      type: "object",
      required: ["DB_CONNECTION_STRING"],
      properties: {
        DB_CONNECTION_STRING: {
          type: "string",
        },
      },
    },
  });

  done();
};

export default databasePlugin;
