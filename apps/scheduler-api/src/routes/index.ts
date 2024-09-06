import tasks from "./tasks/index.js";
import { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.register(tasks, { prefix: "/tasks" });
}
