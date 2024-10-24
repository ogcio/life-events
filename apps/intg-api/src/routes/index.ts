import { FastifyInstance } from "fastify";
import journeys from "./journeys";
import stepConnections from "./stepConnections";
import steps from "./steps";
import executor from "./executor";

export default async function routes(app: FastifyInstance) {
  app.register(journeys, { prefix: "/journeys" });
  app.register(stepConnections, { prefix: "/journey_step_connections" });
  app.register(steps, { prefix: "/journey_steps" });
  app.register(executor, { prefix: "/executor" });
}
