import { FastifyInstance } from "fastify";

export default async (app: FastifyInstance, fileId: string) => {
  return await app.pg.query(`DELETE FROM files WHERE ID = $1`, [fileId]);
};
