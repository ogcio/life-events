import { FastifyBaseLogger } from "fastify";
import { Pool } from "pg";
import { getUserImports } from "../shared-users";
import { UsersImport } from "../../../types/usersSchemaDefinitions";

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
