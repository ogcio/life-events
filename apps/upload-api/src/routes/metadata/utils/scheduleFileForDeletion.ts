import fastifyPostgres from "@fastify/postgres";

export default (pg: fastifyPostgres.PostgresDb, fileId: string, date: Date) => {
  return pg.query(
    `
    UPDATE files
    SET scheduled_deletion_at = $2, expires_at = NULL
    WHERE id = $1;
    `,
    [fileId, date],
  );
};
