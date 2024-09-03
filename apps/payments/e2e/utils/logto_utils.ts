import { APIRequestContext } from "@playwright/test";

const logtoEndpoint = process.env.LOGTO_ENDPOINT;
const logtoResource = process.env.LOGTO_RESOURCE;
const applicationId = process.env.LOGTO_E2E_APP_ID;
const applicationSecret = process.env.LOGTO_E2E_APP_SECRET;

const checkEnvVarsExistence = () => {
  if (
    !logtoEndpoint ||
    !logtoResource ||
    !applicationId ||
    !applicationSecret
  ) {
    throw new Error("Environment variables are missing!");
  }
};

/**
 * For more information about requesting the access token from Logto and
 * interactions with Logto's management API, please visit:
 * https://docs.logto.io/docs/recipes/interact-with-management-api/
 */
export const getLogtoAccessToken = async (request: APIRequestContext) => {
  checkEnvVarsExistence();

  const result = await request.post(`${logtoEndpoint}/oidc/token`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${applicationId}:${applicationSecret}`,
      ).toString("base64")}`,
    },
    data: new URLSearchParams({
      grant_type: "client_credentials",
      resource: logtoResource!,
      scope: "all",
    }).toString(),
  });
  const accessToken = (await result.json()).access_token;
  return accessToken;
};

export const deleteLogtoUser = async (
  request: APIRequestContext,
  userId: string,
  accessToken?: string,
) => {
  checkEnvVarsExistence();

  const _accessToken = accessToken ?? (await getLogtoAccessToken(request));

  await request.delete(`${logtoEndpoint}/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${_accessToken}`,
    },
  });
};
