import { FastifyInstance } from "fastify";

export default async function healthCheck(app: FastifyInstance) {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        hide: true,
        description:
          "It checks the current health status of the APIs, pinging all the related items",
      },
    },
    async () => {
      return { status: "ok" };
    },
  );
}
