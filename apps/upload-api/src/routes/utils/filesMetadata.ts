import { FileMetadataType } from "../../types/schemaDefinitions.js";
import { PoolClient } from "pg";

const baseQuery =
  'SELECT id, key, owner as "ownerId", file_size as "fileSize", mime_type as "mimeType", created_at as "createdAt", last_scan as "lastScan", infected, infection_description as "infectionDescription", deleted, file_name as "fileName" FROM files';

const getOwnedFiles = (client: PoolClient, ownerId: string) => {
  return client.query<FileMetadataType>(
    `
    ${baseQuery}
    WHERE owner = $1
    `,
    [ownerId],
  );
};

const getOrganizationFiles = (
  client: PoolClient,
  organizationId: string,
  toExclude: string[],
) => {
  let query = `
    ${baseQuery}
    WHERE organization_id = $1
  `;

  if (toExclude.length) {
    let i = 2;
    query = `${query} AND id NOT IN (${toExclude.map(() => `$${i++}`).join(", ")})`;
  }

  return client.query<FileMetadataType>(query, [organizationId, ...toExclude]);
};

export { getOwnedFiles, getOrganizationFiles };
