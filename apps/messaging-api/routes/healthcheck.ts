import { FastifyInstance } from "fastify";
import { isLifeEventsError, ServerError } from "shared-errors";
import { getErrorMessage } from "../utils/error-utils";

const ERROR_PROCESS = "HEALTHCHECK";

export default async function healthCheck(app: FastifyInstance) {
  app.get("/health", async () => {
    await checkDb(app);

    return { status: "ok" };
  });
}

const checkDb = async (app: FastifyInstance): Promise<void> => {
  try {
    const pool = await app.pg.connect();
    const res = await pool.query('SELECT 1 as "column"');
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
  }
};
