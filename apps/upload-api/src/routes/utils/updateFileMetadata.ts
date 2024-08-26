import fastifyPostgres from "@fastify/postgres";
import { FileMetadataType } from "../../types/schemaDefinitions.js";

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
  } = metadata;

  return pg.query(
    `
    UPDATE files
    SET
    key = $2,
    owner = $3,
    file_size = $4,
    mime_type = $5,
    created_at = $6,
    last_scan = $7,
    infected = $8,
    infection_description = $9,
    file_name = $10,
    deleted = $11,
    antivirus_db_version = $12
    WHERE id = $1
    RETURNING *;`,
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
      deleted,
      antivirusDbVersion,
    ],
  );
};
