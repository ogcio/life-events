import { Pool, PoolClient } from "pg";
import {
  FindUserParams,
  FoundUser,
  UserDetails,
} from "../../types/schemaDefinitions";
import { isNativeError } from "util/types";
import { createError } from "@fastify/error";
import { httpErrors } from "@fastify/sensible";

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
    throw httpErrors.notFound(`Cannot find user with id ${params.id}`);
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
    findByName,
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

const extendQueryWithUserName = (
  userParams: FindUserParams,
  queryFields: string[],
  queryValues: string[],
) => {
  if (!userParams.firstname || !userParams.lastname) {
    return undefined;
  }

  return {
    queryFields: [...queryFields, "firstname ILIKE $2", "lastname ILIKE $3"],
    queryValues: [...queryValues, userParams.firstname, userParams.lastname],
  };
};

const findByName = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  const userParams = params.findUserParams;

  if (!userParams.firstname || !userParams.lastname) {
    return undefined;
  }

  const queryFields = ["firstname ILIKE $1", "lastname ILIKE $2"];
  const queryValues = [userParams.firstname, userParams.lastname];

  const query = buildFindQuery(queryFields);

  const found = await runFindQuery({
    client: params.client,
    query,
    values: queryValues,
  });

  return found ? { ...found, matchQuality: "exact" } : undefined;
};

const findByPhoneNumber = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  const userParams = params.findUserParams;

  if (!userParams.phone) {
    return undefined;
  }

  let queryFields = ["phone ILIKE $1"];
  let queryValues = [userParams.phone];

  if (userParams.strict) {
    const extendedResult = extendQueryWithUserName(
      userParams,
      queryFields,
      queryValues,
    );

    if (!extendedResult) {
      return undefined;
    }

    queryFields = extendedResult.queryFields;
    queryValues = extendedResult.queryValues;
  }

  const query = buildFindQuery(queryFields);

  const found = await runFindQuery({
    client: params.client,
    query,
    values: queryValues,
  });

  return found ? { ...found, matchQuality: "exact" } : undefined;
};

const findByBirthDate = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  const userParams = params.findUserParams;

  if (!userParams.dateOfBirth) {
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

  let queryFields = [
    `to_char(timezone('${timezoneToUse}',"date_of_birth"),'YYYY-MM-DD') = $1`,
  ];
  let queryValues = [userParams.dateOfBirth];

  if (userParams.strict) {
    const extendedResult = extendQueryWithUserName(
      userParams,
      queryFields,
      queryValues,
    );

    if (!extendedResult) {
      return undefined;
    }

    queryFields = extendedResult.queryFields;
    queryValues = extendedResult.queryValues;
  }

  const query = buildFindQuery(queryFields);

  const found = await runFindQuery({
    client: params.client,
    query,
    values: queryValues,
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

  let queryFields = ["email ILIKE $1"];
  let queryValues = [userParams.email];

  if (userParams.strict) {
    const extendedResult = extendQueryWithUserName(
      userParams,
      queryFields,
      queryValues,
    );

    if (!extendedResult) {
      return undefined;
    }

    queryFields = extendedResult.queryFields;
    queryValues = extendedResult.queryValues;
  }

  const query = buildFindQuery(queryFields);

  const found = await runFindQuery({
    client: params.client,
    query,
    values: queryValues,
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
