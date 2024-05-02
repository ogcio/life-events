import { FastifyInstance } from "fastify";
import timeline from "./timeline";

export default async function routes(app: FastifyInstance) {
  app.register(timeline, { prefix: "/timeline" });
}
