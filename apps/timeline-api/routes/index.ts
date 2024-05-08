import { FastifyInstance } from "fastify";
import timeline from "./timeline/index.js";

export default async function routes(app: FastifyInstance) {
  app.register(timeline, { prefix: "/timeline" });
}
