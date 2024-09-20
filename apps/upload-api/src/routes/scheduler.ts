import { FastifyInstance } from "fastify";
import { getConfigValue } from "../utils/storeConfig.js";

export default async function schduler(app: FastifyInstance) {
  app.post<{ Body: { schedulerToken: string } }>(
    "/",
    { schema: { hide: true } },
    async (request) => {
      const { schedulerToken } = request.body;

      const expectedSchedulerToken = await getConfigValue(
        app.pg.pool,
        "schedulerToken",
      );

      if (schedulerToken !== expectedSchedulerToken) {
        return { status: "ok" };
      }

      //TODO: handle logic here

      return { status: "ok" };
    },
  );
}
