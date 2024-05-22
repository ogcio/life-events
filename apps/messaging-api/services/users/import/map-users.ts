import { createError } from "@fastify/error";
import { FastifyBaseLogger } from "fastify";
import { PoolClient } from "pg";
import { UsersImport } from "../../../types/usersSchemaDefinitions";
import { isNativeError } from "util/types";

export const mapUsers = async (params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
}): Promise<void> => {
  if (process.env.SYNCHRONOUS_USER_IMPORT ?? 0) {
    return mapUsersSync(params);
  }

  return mapUsersAsync(params);
};

const mapUsersAsync = async (_params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
}) => {
  throw new Error("Not implemented yet");
};

const mapUsersSync = async (params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
}) => {
  const userImport = await getUsersImport(params);

  console.log({ userImport });
};

const getUsersImport = async (params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
}): Promise<UsersImport> => {
  try {
    // for now the organisation id is randomic, we have
    // to decide where to store that value in relation to the
    // user
    const result = await params.client.query<UsersImport>(
      `
          select 
            organisation_id as "organisationId",
            imported_at as "importedAt",
            users_data as "usersData",
            import_channel as "importChannel",
            retry_count as "retryCount",
            last_retry_at as "lastRetryAt",
            import_id as "importId"
          from users_imports where import_id = $1
      `,
      [params.importId],
    );
    if (!result.rowCount) {
      throw new Error("Import id not found");
    }
    return result.rows[0];
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      "SERVER_ERROR",
      `Error during gettings users import from db: ${message}`,
      500,
    )();
    throw toOutput;
  }
};
