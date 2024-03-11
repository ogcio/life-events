import { pgpool } from "./dbConnection";
import { FeatureFlag } from "./types/FeatureFlags";

export async function getFeatureFlag(application: string, slug: string) {
  const result = await pgpool.query<FeatureFlag, [string, string]>(
    `SELECT * FROM feature_flags WHERE application = $1 AND slug = $2`,
    [application, slug],
  );
  return result.rows[0];
}

export async function getFeatureFlags(application: string) {
  const result = await pgpool.query<FeatureFlag, [string]>(
    `SELECT * FROM feature_flags WHERE application = $1`,
    [application],
  );
  return result.rows;
}
