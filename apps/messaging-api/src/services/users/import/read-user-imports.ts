import { FastifyBaseLogger } from "fastify";
import { Pool } from "pg";
import { getUserImports } from "../shared-users.js";
import { UsersImport } from "../../../types/usersSchemaDefinitions.js";
import { PaginationParams } from "../../../types/schemaDefinitions.js";
import { httpErrors } from "@fastify/sensible";

export const getUserImportsForOrganisation = async (params: {
  logger: FastifyBaseLogger;
  organisationId: string;
  pool: Pool;
  pagination: Required<PaginationParams>;
}): Promise<{ data: Omit<UsersImport, "usersData">[]; totalCount: number }> => {
  const client = await params.pool.connect();
  try {
    return await getUserImports({
      client,
      whereClauses: ["organisation_id = $1"],
      whereValues: [params.organisationId],
      includeUsersData: false,
      limit: params.pagination.limit
        ? Number(params.pagination.limit)
        : undefined,
      offset: params.pagination.offset
        ? Number(params.pagination.offset)
        : undefined,
    });
  } finally {
    client.release();
  }
};

export const getUserImportForOrganisation = async (params: {
  logger: FastifyBaseLogger;
  organisationId: string;
  importId: string;
  pool: Pool;
  includeUsersData: boolean;
}): Promise<UsersImport> => {
  const client = await params.pool.connect();
  try {
    const results = await getUserImports({
      client,
      whereClauses: ["import_id = $1", "organisation_id = $2"],
      whereValues: [params.importId, params.organisationId],
      limit: 1,
      includeUsersData: params.includeUsersData,
    });

    if (results.data.length === 0) {
      throw httpErrors.notFound(
        `Users import with id ${params.importId} and organisation ${params.organisationId} not found`,
      );
    }

    return results.data[0];
  } finally {
    client.release();
  }
};
