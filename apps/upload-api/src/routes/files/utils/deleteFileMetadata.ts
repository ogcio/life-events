import { FastifyInstance } from "fastify";

export default (app: FastifyInstance, fileId: string) => {
  return app.pg.query(`DELETE FROM files WHERE ID = $1`, [fileId]);
};
