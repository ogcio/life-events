import fastifyPostgres from "@fastify/postgres";
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
    scheduled_deletion_at as "scheduledDeletionAt",
    expires_at as "expiresAt"
  FROM
    files
`;

const EXCLUDE_DELETED = `
  deleted = False
  AND scheduled_deletion_at IS NULL
`;

const getUserFiles = (
  client: PoolClient,
  ownerId: string,
  toExclude: string[],
) => {
  let query = `
  ${baseQuery}
  WHERE owner = $1
  `;

  if (toExclude.length) {
    let i = 2;
    query = `
    ${query} AND id NOT IN (${toExclude.map(() => `$${i++}`).join(", ")})
    `;
  }

  query = `${query} AND ${EXCLUDE_DELETED}`;

  return client.query<FileMetadataType>(query, [ownerId, ...toExclude]);
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
  toExclude: string[],
) => {
  let query = `${baseQuery} 
    INNER JOIN files_users ON files.id = files_users.file_id 
    WHERE files_users.user_id = $1 and files.organization_id = $2`;

  if (toExclude.length) {
    let i = 3;
    query = `${query} AND id NOT IN (${toExclude.map(() => `$${i++}`).join(", ")})`;
  }

  query = `${query} AND ${EXCLUDE_DELETED}`;

  return client.query<FileMetadataType>(query, [
    userId,
    organizationId,
    ...toExclude,
  ]);
};

const getExpiredFiles = (pool: Pool, expirationDate: Date) => {
  const query = `${baseQuery} WHERE scheduled_deletion_at < $1 and deleted = false`;
  return pool.query<FileMetadataType>(query, [expirationDate]);
};

const getDeletionDate = () => {
  const currentDate = new Date();

  const deletionDate = new Date(currentDate);
  deletionDate.setDate(currentDate.getDate() + 30);
  return deletionDate;
};

const scheduleExpiredFilesForDeletion = (pool: Pool) => {
  const date = getDeletionDate();
  const now = new Date();

  return pool.query<FileMetadataType>(
    `
    UPDATE files
    SET scheduled_deletion_at = $1, expires_at = NULL
    WHERE expires_at < $2;
  `,
    [date, now],
  );
};

const scheduleFileForDeletion = (
  pg: fastifyPostgres.PostgresDb,
  fileId: string,
) => {
  const date = getDeletionDate();
  return pg.query(
    `
    UPDATE files
    SET scheduled_deletion_at = $2, expires_at = NULL
    WHERE id = $1;
    `,
    [fileId, date],
  );
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
  getUserFiles,
  getOrganizationFiles,
  getSharedFiles,
  getSharedFilesPerOrganization,
  getExpiredFiles,
  markFilesAsDeleted,
  scheduleExpiredFilesForDeletion,
  scheduleFileForDeletion,
};
