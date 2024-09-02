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

const getSharedFiles = (
  client: PoolClient,
  userId: string,
  toExclude: string[],
) => {
  let query = `${baseQuery} INNER JOIN files_users ON files.id = files_users.file_id WHERE files_users.user_id = $1`;

  if (toExclude.length) {
    let i = 2;
    query = `${query} AND id NOT IN (${toExclude.map(() => `$${i++}`).join(", ")})`;
  }

  return client.query<FileMetadataType>(query, [userId, ...toExclude]);
};

export { getOwnedFiles, getOrganizationFiles, getSharedFiles };
