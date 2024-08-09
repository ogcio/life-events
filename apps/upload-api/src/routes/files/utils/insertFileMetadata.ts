import { FastifyInstance } from "fastify";
import { FileMetadataType } from "../../../types/schemaDefinitions.js";

export default (app: FastifyInstance, metadata: FileMetadataType) => {
  const {
    filename,
    createdAt,
    fileSize,
    infectionDescription,
    key,
    lastScan,
    mimetype,
    infected,
    owner,
    antivirusDbVersion,
  } = metadata;

  return app.pg.query(
    `
      INSERT INTO files (
        key, owner, fileSize, mimetype, createdAt, lastScan, infected, infection_description, filename, antivirus_db_version
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )
          RETURNING *;
          `,
    [
      key,
      owner,
      fileSize,
      mimetype,
      createdAt,
      lastScan,
      infected,
      infectionDescription,
      filename,
      antivirusDbVersion,
    ],
  );
};
