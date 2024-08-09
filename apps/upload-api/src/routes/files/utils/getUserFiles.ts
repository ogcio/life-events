import { FastifyInstance } from "fastify";
import { MetadataType } from "../../../types/schemaDefinitions.js";

export default async (app: FastifyInstance, owner: string) => {
  return await app.pg.query<MetadataType>(
    `SELECT id, key, owner, fileSize as "fileSize", mimetype, createdAt, lastScan, infected, infection_description FROM files
  WHERE owner = $1`,
    [owner],
  );
};
