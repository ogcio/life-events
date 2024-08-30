import fastifyPostgres from "@fastify/postgres";
import { Sharing } from "../../../types/schemaDefinitions.js";

export default (pg: fastifyPostgres.PostgresDb, fileId: string) => {
  return pg.query<Sharing>(
    `
    SELECT file_id as "fileId", user_id as "userId" FROM files_users
    WHERE file_id = $1
  `,
    [fileId],
  );
};
