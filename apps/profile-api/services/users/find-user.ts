import { PoolClient } from "pg";
import { FindUserParams, FoundUser } from "../../types/schemaDefinitions";
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
    queryClauses.push(
      ` $${whereValuesIndex++} $${whereValuesIndex++} $${whereValuesIndex++} `,
    );
    whereValues.push(fieldName, operator, value);
  }
  if (whereValues.length > 0) {
    baseQuery = `${baseQuery} WHERE ${queryClauses.join("AND")}`;
  }
  baseQuery = `${baseQuery} LIMIT 1`;

  return { query: baseQuery, values: whereValues };
};

export const findUser = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  const byPpsn = await findByPpsn(params);
  if (byPpsn) {
    return byPpsn;
  }
};

const findByPpsn = async (params: {
  client: PoolClient;
  findUserParams: FindUserParams;
}): Promise<FoundUser | undefined> => {
  const { client, findUserParams } = params;
  const ppsn = findUserParams.ppsn ? findUserParams.ppsn.trim() : null;
  if (!ppsn || ppsn.length === 0) {
    return undefined;
  }
  const queryValues = buildFindQuery({
    ppsn: { operator: "ILIKE", value: ppsn },
  });

  const found = await runFindQuery({ client, ...queryValues });

  if (!found) {
    return found;
  }

  return { ...found, matchQuality: "exact" };
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
