import { FastifyInstance } from "fastify";
import files from "./files/index.js";
import metadata from "./metadata/index.js";

export default async function routes(app: FastifyInstance) {
  app.register(files, { prefix: "/files" });
  app.register(metadata, { prefix: "/metadata" });
}
