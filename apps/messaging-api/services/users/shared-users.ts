import { createError } from "@fastify/error";
import { PoolClient, QueryResult } from "pg";
import { isNativeError } from "util/types";
import { User } from "../../types/usersSchemaDefinitions";

const getUser = async (params: {
  client: PoolClient;
  whereClauses: string[];
  whereValues: string[];
  errorCode: string;
  logicalWhereOperator?: string;
}): Promise<User> => {
  let result: QueryResult<User>;
  try {
    const operator = params.logicalWhereOperator
      ? ` ${params.logicalWhereOperator} `
      : " AND ";
    result = await params.client.query<User>(
      `
        SELECT 
        id as "id",
        user_profile_id as "userProfileId",
        importer_organisation_id as "importerOrganisationId",
        user_status as "userStatus",
        correlation_quality as "correlationQuality"    
        FROM users where ${params.whereClauses.join(operator)} LIMIT 1
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

export const getUserByContacts = async (params: {
  email: string | null;
  phone: string | null;
  client: PoolClient;
  errorCode: string;
}): Promise<User> => {
  const clauses = [];
  const values = [];
  let phoneIndex = 1;
  if (params.email) {
    clauses.push("email = $1");
    values.push(params.email);
    phoneIndex = 2;
  }

  if (params.phone) {
    clauses.push(`phone = $${phoneIndex}`);
    values.push(params.phone);
  }

  return getUser({
    client: params.client,
    whereClauses: clauses,
    whereValues: values,
    errorCode: params.errorCode,
    logicalWhereOperator: "OR",
  });
};
