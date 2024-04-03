import { FastifyInstance } from "fastify";
export default async function healthCheck(app: FastifyInstance) {
  app.get("/health", async (request, reply) => {
    return { status: "ok" };
  });
}
