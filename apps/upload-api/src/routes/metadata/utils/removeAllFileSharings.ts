import { PostgresDb } from "@fastify/postgres";

export default (pg: PostgresDb, fileId: string) => {
  return pg.query(
    `
    DELETE FROM files_users WHERE file_id = $1
    `,
    [fileId],
  );
};
