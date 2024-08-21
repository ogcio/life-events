import { FileMetadataType } from "../../../types/schemaDefinitions.js";
import fastifyPostgres from "@fastify/postgres";

export default (pg: fastifyPostgres.PostgresDb, metadata: FileMetadataType) => {
  const {
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
        key, owner, file_size, mime_type, created_at, last_scan, infected, infection_description, file_name, antivirus_db_version, deleted, organization_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
          )
          RETURNING *;
          `,
    [
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
