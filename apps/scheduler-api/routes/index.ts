import tasks from "./tasks";
import { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.register(tasks, { prefix: "/tasks" });
}
