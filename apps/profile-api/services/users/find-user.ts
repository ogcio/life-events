import { Pool, PoolClient } from "pg";
import {
  FindUserParams,
  FoundUser,
  UserDetails,
} from "../../types/schemaDefinitions";
import { isNativeError } from "util/types";
import { createError } from "@fastify/error";
import { NotFoundError } from "shared-errors";

type WhereClauseTypes = string | number | null | boolean;
type PartialFoundUser = Omit<FoundUser, "matchQuality">;

export const getUser = async (params: {
  pool: Pool;
  id: string;
}): Promise<UserDetails> => {
  const result = await params.pool.query<UserDetails>(
    `
    SELECT 
      title as "title", 
      firstname as "firstName", 
      lastname as "lastName",
      date_of_birth as "dateOfBirth",
      ppsn as "ppsn",
      ppsn_visible as "ppsnVisible",
      gender as "gender",
      email as "email",
      phone as "phone",
      consent_to_prefill_data as "consentToPrefillData",
      preferred_language as "preferredLanguage"
    FROM user_details WHERE user_id = $1 LIMIT 1`,
    [params.id],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError(
      "GET_USER",
      `Cannot find user with id ${params.id}`,
    );
  }

  return result.rows[0];
};

export const findUser = async (params: {
  pool: Pool;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  const findUserParams = clearFields(params.findUserParams);

  const client = await params.pool.connect();
  const orderedMethodsToInvoke = [
    findByPpsn,
    findByEmailAddress,
    findByPhoneNumber,
    findByBirthDate,
  ];

  try {
    for (const method of orderedMethodsToInvoke) {
      const methodResult = await method({ client, findUserParams });
      if (methodResult) {
        return methodResult;
      }
    }
  } finally {
    client.release();
  }

  return undefined;
};

const findByPhoneNumber = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  const userParams = params.findUserParams;
  if (!userParams.firstname || !userParams.lastname || !userParams.phone) {
    return undefined;
  }

  const query = buildFindQuery([
    "firstname ILIKE $1",
    "lastname ILIKE $2",
    "phone ILIKE $3",
  ]);

  const found = await runFindQuery({
    client: params.client,
    query,
    values: [userParams.firstname, userParams.lastname, userParams.phone],
  });

  return found ? { ...found, matchQuality: "exact" } : undefined;
};

const findByBirthDate = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  const userParams = params.findUserParams;
  if (
    !userParams.firstname ||
    !userParams.lastname ||
    !userParams.dateOfBirth
  ) {
    return undefined;
  }

  // We need to set the same timezone in both Node server
  // and query to make the comparison between dates the same
  // because can happen that, using different TZ, PGsql compares
  // the "date_of_birth" column using the day before
  // e.g. 1990-01-10 00:00:00.000 +0100 becomes 1990-01-09
  const oldTz = process.env.TZ;
  const timezoneToUse = "Europe/Rome";
  process.env.TZ = timezoneToUse;

  const query = buildFindQuery([
    "firstname ILIKE $1",
    "lastname ILIKE $2",
    `to_char(timezone('${timezoneToUse}',"date_of_birth"),'YYYY-MM-DD') = $3`,
  ]);

  const found = await runFindQuery({
    client: params.client,
    query,
    values: [userParams.firstname, userParams.lastname, userParams.dateOfBirth],
  });

  process.env.TZ = oldTz;

  return found ? { ...found, matchQuality: "approximate" } : undefined;
};

const findByEmailAddress = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  const userParams = params.findUserParams;
  if (!userParams.email) {
    return undefined;
  }

  const query = buildFindQuery(["email ILIKE $1"]);

  const found = await runFindQuery({
    client: params.client,
    query,
    values: [userParams.email],
  });

  return found ? { ...found, matchQuality: "exact" } : undefined;
};

const findByPpsn = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  if (!params.findUserParams.ppsn) {
    return undefined;
  }

  const query = buildFindQuery(["ppsn ILIKE $1"]);

  const found = await runFindQuery({
    client: params.client,
    query,
    values: [params.findUserParams.ppsn],
  });

  return found ? { ...found, matchQuality: "exact" } : undefined;
};

const buildFindQuery = (whereClauses: string[]): string => {
  let query = `
        SELECT 
            user_id as "id",
            firstname as "firstname",
            lastname as "lastname"
        FROM 
            user_details
    `;

  if (whereClauses.length > 0) {
    query = `${query} WHERE ${whereClauses.join(" AND ")}`;
  }

  return `${query} LIMIT 1`;
};

const runFindQuery = async (params: {
  client: PoolClient;
  query: string;
  values: WhereClauseTypes[];
}): Promise<PartialFoundUser | undefined> => {
  try {
    const result = await params.client.query<FoundUser>(
      params.query,
      params.values,
    );

    return result.rows[0] ?? undefined;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      "FIND_USER_ERROR",
      `Error running a find user query: ${message}`,
      500,
    )();

    throw toOutput;
  }
};

const clearField = (valueToClear: string | undefined): string | undefined =>
  valueToClear && valueToClear.trim().length > 0
    ? valueToClear.trim()
    : undefined;

const clearFields = (params: FindUserParams): FindUserParams => ({
  ppsn: clearField(params.ppsn),
  phone: clearField(params.phone),
  lastname: clearField(params.lastname),
  firstname: clearField(params.firstname),
  dateOfBirth: clearField(params.dateOfBirth),
  email: clearField(params.email),
  gender: clearField(params.gender),
});
