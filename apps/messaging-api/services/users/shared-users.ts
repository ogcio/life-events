import { createError } from "@fastify/error";
import { PoolClient, QueryResult } from "pg";
import { isNativeError } from "util/types";
import { User } from "../../types/usersSchemaDefinitions";

const getUser = async (params: {
  client: PoolClient;
  whereClauses: string[];
  whereValues: string[];
  errorCode: string;
}): Promise<User> => {
  let result: QueryResult<User>;
  try {
    result = await params.client.query<User>(
      `
        SELECT 
        id as "id",
        user_profile_id as "userProfileId",
        importer_organisation_id as "importerOrganisationId",
        user_status as "userStatus",
        correlation_quality as "correlationQuality"    
        FROM users where ${params.whereClauses.join(" AND ")} LIMIT 1
      `,
      params.whereValues,
    );
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw createError(
      params.errorCode,
      `Error retrieving user: ${message}`,
      500,
    )();
  }

  if (result && result.rowCount) {
    return result.rows[0];
  }

  throw createError(params.errorCode, "Cannot find the user", 404)();
};

export const getUserById = async (params: {
  client: PoolClient;
  userId: string;
  errorCode: string;
}): Promise<User> =>
  getUser({
    client: params.client,
    whereClauses: ["id = $1"],
    whereValues: [params.userId],
    errorCode: params.errorCode,
  });

export const getUserByUserProfileId = async (params: {
  userProfileId: string;
  client: PoolClient;
  errorCode: string;
}): Promise<User> =>
  getUser({
    client: params.client,
    whereClauses: ["user_profile_id = $1"],
    whereValues: [params.userProfileId],
    errorCode: params.errorCode,
  });
