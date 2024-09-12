import "dotenv/config";

const getMandatoryKey = (keyName: string): string => {
  if (process.env[keyName]) {
    return process.env[keyName];
  }

  throw new Error(`The mandatory env var ${keyName} is missing`);
};

export const configKeys = {
  organizationId: getMandatoryKey("ORGANIZATION_ID"),
};
