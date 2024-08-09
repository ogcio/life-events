import { FastifyInstance } from "fastify";
import { FileMetadataType } from "../../../types/schemaDefinitions.js";

export default (app: FastifyInstance, fileId: string, owner: string) =>
  app.pg.query<FileMetadataType>(
    `SELECT id, key, owner, fileSize as "fileSize", mimetype, createdAt as "createdAt", lastScan as "lastScan", infected, infection_description, filename, antivirus_db_version as "antivirusDbVersion" FROM files
  WHERE id = $1 AND owner = $2`,
    [fileId, owner],
  );
