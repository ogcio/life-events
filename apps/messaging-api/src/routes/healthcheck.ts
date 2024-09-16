import { FastifyInstance } from "fastify";
import { isLifeEventsError, ServerError } from "shared-errors";
import { getErrorMessage } from "../utils/error-utils.js";
import getVersion from "../utils/get-version.js";
const ERROR_PROCESS = "HEALTHCHECK";

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
      await checkDb(app);
      const version = await getVersion();
      return { "messaging-api": version };
    },
  );
}

const checkDb = async (app: FastifyInstance): Promise<void> => {
  const pool = await app.pg.connect();
  try {
    const res = await app.pg.query('SELECT 1 as "column"');
    if (res.rowCount !== 1) {
      throw new ServerError(
        ERROR_PROCESS,
        `Expected 1 record, got ${res.rowCount}`,
      );
    }
  } catch (e) {
    if (isLifeEventsError(e)) {
      throw e;
    }

    throw new ServerError(ERROR_PROCESS, getErrorMessage(e));
  } finally {
    pool.release();
  }
};
