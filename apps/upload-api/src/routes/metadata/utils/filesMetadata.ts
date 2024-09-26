import { FileMetadataType } from "../../../types/schemaDefinitions.js";
import { Pool, PoolClient } from "pg";

const baseQuery = `
  SELECT 
    id,
    key,
    owner as "ownerId",
    file_size as "fileSize",
    mime_type as "mimeType",
    created_at as "createdAt",
    last_scan as "lastScan",
    infected,
    infection_description as "infectionDescription", 
    deleted, 
    file_name as "fileName",
    scheduled_deletion_at as "scheduledDeletionAt"
  FROM
    files
`;

const EXCLUDE_DELETED = `
  deleted = False
  AND scheduled_deletion_at IS NULL
`;

const getOwnedFiles = (client: PoolClient, ownerId: string) => {
  return client.query<FileMetadataType>(
    `
    ${baseQuery}
    WHERE owner = $1
    AND ${EXCLUDE_DELETED}
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
    query = `
    ${query} AND id NOT IN (${toExclude.map(() => `$${i++}`).join(", ")})
    `;
  }

  query = `${query} AND ${EXCLUDE_DELETED}`;

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

  query = `${query} AND ${EXCLUDE_DELETED}`;

  return client.query<FileMetadataType>(query, [userId, ...toExclude]);
};

const getSharedFilesPerOrganization = (
  client: PoolClient,
  organizationId: string,
  userId: string,
) => {
  const query = `${baseQuery} 
    INNER JOIN files_users ON files.id = files_users.file_id 
    WHERE files_users.user_id = $1 and files.organization_id = $2
    AND ${EXCLUDE_DELETED};
  `;

  return client.query<FileMetadataType>(query, [userId, organizationId]);
};

const getExpiredFiles = (pool: Pool, expirationDate: Date) => {
  const query = `${baseQuery} WHERE scheduled_deletion_at < $1 and deleted = false`;
  return pool.query<FileMetadataType>(query, [expirationDate]);
};

const markFilesAsDeleted = (pool: Pool, ids: string[]) => {
  return pool.query<FileMetadataType>(
    `
    UPDATE files
    SET deleted = true, deleted_at = NOW()
    WHERE id = ANY($1::uuid[]);
  `,
    [ids],
  );
};

export {
  getOwnedFiles,
  getOrganizationFiles,
  getSharedFiles,
  getSharedFilesPerOrganization,
  getExpiredFiles,
  markFilesAsDeleted,
};
