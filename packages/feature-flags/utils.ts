import { pgpool } from "./dbConnection";
import { FeatureFlag } from "./types/FeatureFlags";

const defaultFeatureFlags = {
  events: {
    enabled: true,
  },
  "about-me": {
    enabled: true,
  },
  birth: {
    enabled: true,
  },
  health: {
    enabled: true,
  },
  driving: {
    enabled: true,
  },
  employment: {
    enabled: true,
  },
  business: {
    enabled: true,
  },
  housing: {
    enabled: true,
  },
  death: {
    enabled: true,
  },
};

export async function getFeatureFlag(application: string, slug: string) {
  const result = await pgpool.query<FeatureFlag, [string, string]>(
    `SELECT * FROM feature_flags WHERE application = $1 AND slug = $2`,
    [application, slug],
  );
  return result.rows[0];
}

export async function isEnabled(featureFlagName: string, application?: string) {
  const featureFlag = await getFeatureFlag(
    application || "portal",
    featureFlagName,
  );

  if (!featureFlag) {
    return defaultFeatureFlags[featureFlagName].enabled;
  }

  return Boolean(featureFlag?.is_enabled);
}

export async function getFeatureFlags(application: string) {
  const result = await pgpool.query<FeatureFlag, [string]>(
    `SELECT * FROM feature_flags WHERE application = $1`,
    [application],
  );
  return result.rows;
}
