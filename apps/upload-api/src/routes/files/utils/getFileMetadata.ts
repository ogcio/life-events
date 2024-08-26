import { FileMetadataType } from "../../../types/schemaDefinitions.js";
import fastifyPostgres from "@fastify/postgres";

export default (
  pg: fastifyPostgres.PostgresDb,
  fileId: string,
  owner: string,
  organizationId?: string,
) => {
  let query = `
    SELECT id, key, owner, file_size as "fileSize", mime_type as "mimeType", created_at as "createdAt", last_scan as "lastScan", infected, infection_description as "infectionDescription", file_name as "fileName", antivirus_db_version as "antivirusDbVersion" FROM files
    WHERE id = $1
  `;
  const params = [fileId, owner];

  if (organizationId) {
    query = `${query} AND (owner = $2 OR organization_id = $3)`;
    params.push(organizationId);
  } else {
    query = `${query} AND owner = $2`;
  }
  return pg.query<FileMetadataType>(query, params);
};
