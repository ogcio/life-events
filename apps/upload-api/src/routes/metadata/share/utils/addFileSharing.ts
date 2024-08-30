import { PostgresDb } from "@fastify/postgres";

export default (pg: PostgresDb, fileId: string, userId: string) => {
  return pg.query(
    `
    INSERT INTO files_users (file_id, user_id) VALUES ($1, $2)
    `,
    [fileId, userId],
  );
};
