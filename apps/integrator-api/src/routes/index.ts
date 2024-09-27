import { FastifyInstance } from "fastify";
import journeys from "./journeys/index.js";

export default async function routes(app: FastifyInstance) {
  app.register(journeys, { prefix: "/journeys" });
}
