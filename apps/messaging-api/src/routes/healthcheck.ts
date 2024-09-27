import { FastifyInstance } from "fastify";
import { getErrorMessage } from "../utils/error-utils.js";
import getVersion from "../utils/get-version.js";
import { httpErrors } from "@fastify/sensible";
import { isHttpError } from "http-errors";

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
      throw httpErrors.internalServerError(
        `Expected 1 record, got ${res.rowCount}`,
      );
    }
  } catch (e) {
    if (isHttpError(e)) {
      throw e;
    }

    throw httpErrors.internalServerError(getErrorMessage(e));
  } finally {
    pool.release();
  }
};
