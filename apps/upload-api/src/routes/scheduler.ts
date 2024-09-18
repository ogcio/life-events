import { FastifyInstance } from "fastify";
import { getConfigValue } from "../utils/storeConfig.js";

export default async function schduler(app: FastifyInstance) {
  app.post<{ Body: { callbackUuid: string } }>(
    "/",
    { schema: { hide: true } },
    async (request) => {
      const { callbackUuid } = request.body;

      const expectedUuid = await getConfigValue(
        app.pg.pool,
        "schedulerCallback",
      );

      if (callbackUuid !== expectedUuid) {
        return { status: "ok" };
      }

      //TODO: handle logic here

      return { status: "ok" };
    },
  );
}
