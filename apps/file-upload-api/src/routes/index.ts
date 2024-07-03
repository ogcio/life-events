import { FastifyInstance } from "fastify";
import healthCheck from "./healthcheck.js";
import files from "./files/index.js";

export default async function routes(app: FastifyInstance) {
  app.register(healthCheck);
  app.register(files, { prefix: "/files" });
}
