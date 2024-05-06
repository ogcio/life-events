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
  eventsMenu: {
    enabled: true,
  },
};

export async function isFeatureFlagEnabled(
  name: string,
  application: string = "portal",
) {
  const result = await pgpool.query<FeatureFlag, [string, string]>(
    `SELECT * FROM feature_flags WHERE application = $1 AND slug = $2`,
    [application, name],
  );

  const featureFlag = result.rows[0];

  if (!featureFlag) {
    return defaultFeatureFlags[name].enabled;
  }

  return Boolean(featureFlag?.is_enabled);
}

export async function getAllEnabledFlags(
  names: string[],
  application: string = "portal",
) {
  const result = await pgpool.query<FeatureFlag, [string, string[]]>(
    `SELECT * FROM feature_flags WHERE application = $1 AND slug = ANY($2) AND is_enabled = TRUE`,
    [application, names],
  );

  const flags: string[] = [];
  for (const name of names) {
    if (!result.rows.find((r) => r.slug === name)) {
      if (defaultFeatureFlags[name].enabled) {
        flags.push(name);
      }
    } else {
      flags.push(name);
    }
  }

  return flags;
}

export async function getFeatureFlags(application: string) {
  const result = await pgpool.query<FeatureFlag, [string]>(
    `SELECT * FROM feature_flags WHERE application = $1`,
    [application],
  );
  return result.rows;
}
