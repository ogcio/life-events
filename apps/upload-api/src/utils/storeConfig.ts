import { Pool } from "pg";

export enum CONFIG_TYPE {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export const SCHEDULER_TOKEN = "SCHEDULER_TOKEN";

const storeConfig = (
  pool: Pool,
  key: string,
  value: number | string | boolean,
  description: string,
  type: CONFIG_TYPE,
) => {
  return pool.query(
    `
    INSERT INTO settings (key, value, type, description, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (key)
    DO UPDATE SET 
      value = EXCLUDED.value,
      type = EXCLUDED.type,
      description = EXCLUDED.description,
      updated_at = NOW();
    `,
    [key, value, type, description],
  );
};

const getConfigValue = async (pool: Pool, key: string) => {
  const valueQueryResult = await pool.query<{
    key: string;
    value: string;
    type: string;
  }>("SELECT key, value, type FROM settings WHERE key = $1", [key]);
  if (valueQueryResult.rows.length) {
    const { value, type } = valueQueryResult.rows[0];

    switch (type) {
      case CONFIG_TYPE.STRING: {
        return value;
      }
      case CONFIG_TYPE.NUMBER: {
        return parseInt(value);
      }
      case CONFIG_TYPE.BOOLEAN: {
        return Boolean(value);
      }
    }
  }

  return undefined;
};

export { storeConfig, getConfigValue };
