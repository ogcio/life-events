import { FastifyInstance } from "fastify";
import { MetadataType } from "../../../types/schemaDefinitions.js";

export default async (app: FastifyInstance, fileId: string, owner: string) => {
  return await app.pg.query<MetadataType>(
    `SELECT id, key, owner, fileSize as "fileSize", mimetype, createdAt as "createdAt", lastScan as "lastScan", infected, infection_description, filename FROM files
  WHERE id = $1 AND owner = $2`,
    [fileId, owner],
  );
};
