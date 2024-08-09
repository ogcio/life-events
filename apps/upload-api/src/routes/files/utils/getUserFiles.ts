import { FastifyInstance } from "fastify";
import { FileMetadataType } from "../../../types/schemaDefinitions.js";

export default async (app: FastifyInstance, owner: string) => {
  return await app.pg.query<FileMetadataType>(
    `SELECT id, key, owner, fileSize as "fileSize", mimetype, createdAt as "createdAt", lastScan as "lastScan", infected, infection_description, filename FROM files
  WHERE owner = $1`,
    [owner],
  );
};
