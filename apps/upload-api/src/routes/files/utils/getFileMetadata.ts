import { FastifyInstance } from "fastify";
import { FileMetadataType } from "../../../types/schemaDefinitions.js";

export default (
  app: FastifyInstance,
  fileId: string,
  owner: string,
  organizationId?: string,
) => {
  let query = `
    SELECT id, key, owner, fileSize as "fileSize", mimetype, createdAt as "createdAt", lastScan as "lastScan", infected, infection_description as "infectionDescription", filename, antivirus_db_version as "antivirusDbVersion" FROM files
    WHERE id = $1
  `;
  const params = [fileId, owner];

  if (organizationId) {
    query = `${query} AND (owner = $2 OR organization_id = $3)`;
    params.push(organizationId);
  } else {
    query = `${query} AND owner = $2`;
  }

  return app.pg.query<FileMetadataType>(query, params);
};
