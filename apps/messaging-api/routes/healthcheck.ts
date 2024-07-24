import { FastifyInstance } from "fastify";
import { ServerError } from "shared-errors";
export default async function healthCheck(app: FastifyInstance) {
  app.get("/health", async () => {
    await checkDb(app);

    return { status: "ok" };
  });
}

const checkDb = async (app: FastifyInstance): Promise<void> => {
  const pool = await app.pg.connect();
  const res = await pool.query('SELECT 1 as "column"');
  if (res.rowCount !== 1) {
    throw new ServerError(
      "HEALTHCHECK",
      `Expected 1 record, got ${res.rowCount}`,
    );
  }
};
