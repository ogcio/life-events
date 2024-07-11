import { Pool } from "pg";
import { CreateUser } from "../../types/schemaDefinitions";

export const createUser = async (params: {
  pool: Pool;
  createUserData: CreateUser;
  userId: string;
}): Promise<{ id: string }> => {
  const query = buildInsertQuery(params.createUserData, params.userId);

  const result = await params.pool.query<{ id: string }>(
    query.query,
    query.values,
  );

  return result.rows[0];
};

const buildInsertQuery = (
  createUserData: CreateUser,
  userId: string,
): { query: string; values: (string | number | boolean | null)[] } => {
  const inputToColumnsMapping = new Map<string, string>([
    ["firstname", "firstname"],
    ["lastname", "lastname"],
    ["email", "email"],
    ["title", "title"],
    ["dateOfBirth", "date_of_birth"],
    ["ppsn", "ppsn"],
    ["ppsnVisible", "ppsn_visible"],
    ["gender", "gender"],
    ["phone", "phone"],
    ["consentToPrefillData", "consent_to_prefill_data"],
  ]);

  let index = 2;
  const indexes: string[] = ["$1"];
  const values: (string | number | boolean | null)[] = [userId];
  const columns: string[] = ["user_id"];
  const toMapObject = createUserData as {
    [key: string]: string | number | boolean | null;
  };
  for (const column in inputToColumnsMapping) {
    if (column in toMapObject && toMapObject[column]) {
      indexes.push(`$${index++}`);
      values.push(toMapObject[column]);
      columns.push(inputToColumnsMapping.get(column)!);
    }
  }
  return {
    query: `
I           INSERT INTO user_details (${columns.join(", ")})
                VALUES (${indexes.join(", ")})
            RETURNING user_id as id
        `,
    values,
  };
};
