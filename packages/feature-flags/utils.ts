import { pgpool } from "./dbConnection";
import { FeatureFlag } from "./types/FeatureFlags";

export async function isFeatureFlagEnabled(
  name: string,
  application: string = "portal",
) {
  const result = await pgpool.query<FeatureFlag, [string, string]>(
    `SELECT * FROM feature_flags WHERE application = $1 AND slug = $2`,
    [application, name],
  );

  return result.rows[0] && result.rows[0].is_enabled;
}

export async function getAllEnabledFlags(
  names: string[],
  application: string = "portal",
) {
  const result = await pgpool.query<FeatureFlag, [string, string[]]>(
    `SELECT * FROM feature_flags WHERE application = $1 AND slug = ANY($2) AND is_enabled = TRUE`,
    [application, names],
  );

  return result.rows.map(({ title }) => title);
}

export async function getFeatureFlags(application: string) {
  const result = await pgpool.query<FeatureFlag, [string]>(
    `SELECT * FROM feature_flags WHERE application = $1`,
    [application],
  );
  return result.rows;
}
