import { Pool, PoolClient } from "pg";
import {
  FindUserParams,
  FoundUser,
  MatchQuality,
  UserDetailColumnsMapping,
} from "../../types/schemaDefinitions";
import { isNativeError } from "util/types";
import { createError } from "@fastify/error";

type WhereClauseTypes = string | number | null | boolean;
type PartialFoundUser = Omit<FoundUser, "matchQuality">;
const buildFindQuery = (whereClauses: {
  [x: string]:
    | WhereClauseTypes
    | { value: WhereClauseTypes; operator: "=" | "LIKE" | "ILIKE" };
}): { query: string; values: WhereClauseTypes[] } => {
  let baseQuery = `
        SELECT 
            user_id as "id",
            firstname as "firstname",
            lastname as "lastname"
        FROM 
            user_details
    `;

  const queryClauses = [];
  let whereValuesIndex = 1;
  const whereValues = [];
  for (const fieldName in whereClauses) {
    let operator = "=";
    let value = whereClauses[fieldName];
    if (typeof value === "object") {
      operator = value!.operator;
      value = value!.value;
    }
    queryClauses.push(` ${fieldName} ${operator} $${whereValuesIndex++} `);
    whereValues.push(value);
  }
  if (whereValues.length > 0) {
    baseQuery = `${baseQuery} WHERE ${queryClauses.join("AND")}`;
  }
  baseQuery = `${baseQuery} LIMIT 1`;

  return { query: baseQuery, values: whereValues };
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

const normalizeBirthDate = (
  birthDate: string | undefined,
): string | undefined => {
  const cleared = clearField(birthDate);
  if (!cleared) {
    return undefined;
  }

  return `${cleared}::timestamp`;
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
  dateOfBirth: normalizeBirthDate(params.dateOfBirth),
  email: clearField(params.email),
  gender: clearField(params.gender),
});

const findBy = async (params: {
  matchQuality: MatchQuality;
  fields: {
    name: string;
    operator?: "LIKE" | "ILIKE" | "=";
    mandatory: boolean;
  }[];
  client: PoolClient;
  findUserParams: FindUserParams;
}) => {
  const { matchQuality, fields, client, findUserParams } = params;
  const toQuery: {
    [x: string]: { value: WhereClauseTypes; operator: "=" | "LIKE" | "ILIKE" };
  } = {};
  const indexedUserParams: { [x: string]: undefined | string } = findUserParams;
  const indexedColumnsMapping: { [x: string]: string } =
    UserDetailColumnsMapping;
  for (const field of fields) {
    // if the field is needed for querying but it is empty
    // we don't run the query and return not found user
    if (!indexedUserParams[field.name] && field.mandatory) {
      return undefined;
    }

    if (!(field.name in indexedColumnsMapping)) {
      return undefined;
    }

    if (indexedUserParams[field.name]) {
      toQuery[indexedColumnsMapping[field.name]] = {
        operator: field.operator ?? "=",
        value: indexedUserParams[field.name]!,
      };
    }
  }

  const found = await runFindQuery({ client, ...buildFindQuery(toQuery) });

  if (!found) {
    return found;
  }

  return { ...found, matchQuality };
};

const findByPhoneNumber = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> =>
  findBy({
    ...params,
    matchQuality: "exact",
    fields: [
      { name: "firstname", operator: "ILIKE", mandatory: true },
      { name: "lastname", operator: "ILIKE", mandatory: true },
      { name: "phone", operator: "ILIKE", mandatory: true },
    ],
  });

const findByBirthDate = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> =>
  findBy({
    ...params,
    matchQuality: "approximate",
    fields: [
      { name: "firstname", operator: "ILIKE", mandatory: true },
      { name: "lastname", operator: "ILIKE", mandatory: true },
      { name: "dateOfBirth", operator: "=", mandatory: true },
    ],
  });

const findByEmailAddress = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> =>
  findBy({
    ...params,
    matchQuality: "exact",
    fields: [
      { name: "firstname", operator: "ILIKE", mandatory: true },
      { name: "lastname", operator: "ILIKE", mandatory: true },
      { name: "email", operator: "ILIKE", mandatory: true },
    ],
  });

const findByPpsn = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> =>
  findBy({
    ...params,
    matchQuality: "exact",
    fields: [{ name: "ppsn", mandatory: true, operator: "ILIKE" }],
  });

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
