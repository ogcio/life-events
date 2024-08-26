import fastifyPostgres from "@fastify/postgres";
import { FileMetadataType } from "../../types/schemaDefinitions.js";
import { PoolClient } from "pg";

const baseQuery =
  'SELECT id, key, owner as "ownerId", file_size as "fileSize", mime_type as "mimeType", created_at as "createdAt", last_scan as "lastScan", infected, infection_description as "infectionDescription", deleted, file_name as "fileName" FROM files';

const getOwnedFiles = (connection: PoolClient, ownerId: string) => {
  return connection.query<FileMetadataType>(
    `
    ${baseQuery}
    WHERE owner = $1
    `,
    [ownerId],
  );
};

const getOrganizationFiles = (
  connection: PoolClient,
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

  return connection.query<FileMetadataType>(query, [
    organizationId,
    ...toExclude,
  ]);
};

export default async (
  pg: fastifyPostgres.PostgresDb,
  owner: string,
  organizationId?: string,
) => {
  const client = await pg.pool.connect();
  try {
    const ownedFilesData = await getOwnedFiles(client, owner);

    const ownedFiles = ownedFilesData.rows;

    let organizationFiles: FileMetadataType[] = [];
    if (organizationId) {
      const organizationFilesData = await getOrganizationFiles(
        client,
        organizationId,
        ownedFiles.map(({ id }) => id as string),
      );

      if (organizationFilesData.rows.length > 0) {
        organizationFiles = organizationFilesData.rows;
      }
    }

    return [...ownedFiles, ...organizationFiles];
  } finally {
    client.release();
  }
};
