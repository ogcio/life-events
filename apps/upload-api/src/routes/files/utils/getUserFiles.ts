import { FileMetadataType } from "../../../types/schemaDefinitions.js";
import fastifyPostgres from "@fastify/postgres";

export default (
  pg: fastifyPostgres.PostgresDb,
  owner: string,
  organizationId?: string,
) => {
  let query = `
    SELECT id, key, owner, file_size as "fileSize", mime_type as "mimeType", created_at as "createdAt", last_scan as "lastScan", infected, infection_description as "infectionDescription", deleted, file_name as "fileName" FROM files
    WHERE owner = $1
    `;

  const params = [owner];

  if (organizationId) {
    query = `${query} OR organization_id = $2`;
    params.push(organizationId);
  }
  return pg.query<FileMetadataType>(query, params);
};
