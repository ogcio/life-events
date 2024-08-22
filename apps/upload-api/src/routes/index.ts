import { FastifyInstance } from "fastify";
import files from "./files/index.js";

export default async function routes(app: FastifyInstance) {
  app.register(files, { prefix: "/files" });
}
