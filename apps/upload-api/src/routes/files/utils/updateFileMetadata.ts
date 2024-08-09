import { FastifyInstance } from "fastify";
import { FileMetadataType } from "../../../types/schemaDefinitions.js";

export default async (app: FastifyInstance, metadata: FileMetadataType) => {
  const {
    id,
    filename,
    createdAt,
    fileSize,
    infectionDescription,
    key,
    lastScan,
    deleted,
    mimetype,
    infected,
    owner,
    antivirusDbVersion,
  } = metadata;

  await app.pg.query(
    `
     UPDATE files
    SET
    key=$2,
    owner = $3,
    fileSize = $4,
    mimetype = $5,
    createdAt = $6,
    lastScan = $7,
    infected = $8,
    infection_description = $9,
    filename = $10,
    deleted = $11,
    antivirus_db_version = $12
    WHERE id = $1
    RETURNING *;`,
    [
      id,
      key,
      owner,
      fileSize,
      mimetype,
      createdAt,
      lastScan,
      infected,
      infectionDescription,
      filename,
      deleted,
      antivirusDbVersion,
    ],
  );
};
