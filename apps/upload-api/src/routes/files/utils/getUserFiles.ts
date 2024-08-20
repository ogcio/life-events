import { FastifyInstance } from "fastify";
import { FileMetadataType } from "../../../types/schemaDefinitions.js";

export default async (
  app: FastifyInstance,
  owner: string,
  organizationId?: string,
) => {
  let query = `
    SELECT id, key, owner, fileSize as "fileSize", mimetype, createdAt as "createdAt", lastScan as "lastScan", infected, infection_description as "infectionDescription", deleted, filename FROM files
    WHERE owner = $1
    `;

  const params = [owner];

  if (organizationId) {
    query = `${query} OR organization_id = $2`;
    params.push(organizationId);
  }
  return await app.pg.query<FileMetadataType>(query, params);
};
