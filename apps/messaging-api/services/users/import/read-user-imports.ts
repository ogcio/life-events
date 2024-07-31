import { FastifyBaseLogger } from "fastify";
import { Pool } from "pg";
import { getUserImports } from "../shared-users";
import { UsersImport } from "../../../types/usersSchemaDefinitions";
import { NotFoundError } from "shared-errors";

export const READ_USER_IMPORTS_ERROR = "READ_USER_IMPORTS_ERROR";

export const getUserImportsForOrganisation = async (params: {
  logger: FastifyBaseLogger;
  organisationId: string;
  pool: Pool;
}): Promise<Omit<UsersImport, "usersData">[]> => {
  const client = await params.pool.connect();
  try {
    return await getUserImports({
      client,
      whereClauses: ["organisation_id = $1"],
      whereValues: [params.organisationId],
      errorCode: READ_USER_IMPORTS_ERROR,
      includeUsersData: false,
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
      errorCode: READ_USER_IMPORTS_ERROR,
      includeUsersData: params.includeUsersData,
    });

    if (results.length === 0) {
      throw new NotFoundError(
        READ_USER_IMPORTS_ERROR,
        `Users import with id ${params.importId} and organisation ${params.organisationId} not found`,
      );
    }

    return results[0];
  } finally {
    client.release();
  }
};
