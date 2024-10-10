import { PostgresDb } from "@fastify/postgres";

export default (pg: PostgresDb, fileId: string, userId: string) => {
  return pg.query(
    `
    DELETE FROM files_users WHERE file_id = $1 AND user_id = $2   
    `,
    [fileId, userId],
  );
};
