import { FastifyInstance } from "fastify";
import journeys from "./journeys";
import citizen from "./citizen";

export default async function routes(app: FastifyInstance) {
  app.register(citizen, { prefix: "/citizen" });
  app.register(journeys, { prefix: "/journeys" });
}
