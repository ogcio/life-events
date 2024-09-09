import { FastifyInstance } from "fastify";
import { getSchedulerSdk } from "../utils/authentication-factory.js";

export default async function healthCheck(app: FastifyInstance) {
  app.get("/health", async () => {
    return { status: "ok" };
  });
}
