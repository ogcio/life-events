import fastifyPostgres from "@fastify/postgres";
import { FileMetadataType } from "../../types/schemaDefinitions.js";

export default (pg: fastifyPostgres.PostgresDb, fileId: string) => {
  return pg.query<FileMetadataType>(
    `
    SELECT id, key, owner as "ownerId", file_size as "fileSize", mime_type as "mimeType", created_at as "createdAt", last_scan as "lastScan", infected, infection_description as "infectionDescription", file_name as "fileName", antivirus_db_version as "antivirusDbVersion" FROM files
    WHERE id = $1
  `,
    [fileId],
  );
};
