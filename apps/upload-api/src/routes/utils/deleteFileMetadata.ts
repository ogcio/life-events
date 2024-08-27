import fastifyPostgres from "@fastify/postgres";

export default (pg: fastifyPostgres.PostgresDb, fileId: string) => {
  return pg.query(`DELETE FROM files WHERE ID = $1`, [fileId]);
};
