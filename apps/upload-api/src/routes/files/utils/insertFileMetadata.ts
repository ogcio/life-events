import fastifyPostgres from "@fastify/postgres";
import { FileMetadataType } from "../../../types/schemaDefinitions.js";

export default (pg: fastifyPostgres.PostgresDb, metadata: FileMetadataType) => {
  const {
    id,
    fileName,
    createdAt,
    fileSize,
    infectionDescription,
    key,
    lastScan,
    deleted,
    mimeType,
    infected,
    ownerId,
    antivirusDbVersion,
    organizationId,
  } = metadata;

  return pg.query(
    `
      INSERT INTO files (
        id, key, owner, file_size, mime_type, created_at, last_scan, infected, infection_description, file_name, antivirus_db_version, deleted, organization_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
          )
          RETURNING *;
          `,
    [
      id,
      key,
      ownerId,
      fileSize,
      mimeType,
      createdAt,
      lastScan,
      infected,
      infectionDescription,
      fileName,
      antivirusDbVersion,
      deleted,
      organizationId,
    ],
  );
};
