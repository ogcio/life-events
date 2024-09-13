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

export const checkResponse = <T>(response: {
  error?: { code: string; detail: string; requestId: string; name: string };
  data: T | undefined;
}) => {
  if (
    response.error ||
    !response.data ||
    (Array.isArray(response.data) && response.data.length === 0)
  ) {
    console.log({ RESPONSE_ERROR: response.error });
    throw new Error("Error sending message");
  }

  return response.data;
};

export const scheduleNow = () => new Date().toISOString();
