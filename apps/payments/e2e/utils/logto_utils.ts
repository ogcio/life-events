import { APIRequestContext } from "@playwright/test";

const logtoEndpoint = process.env.LOGTO_ENDPOINT || "";
const logtoResource = process.env.LOGTO_RESOURCE || "";
const applicationId = process.env.LOGTO_E2E_APP_ID || "";
const applicationSecret = process.env.LOGTO_E2E_APP_SECRET || "";

export const getLogtoAccessToken = async (request: APIRequestContext) => {
  const result = await request.post(`${logtoEndpoint}/oidc/token`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${applicationId}:${applicationSecret}`,
      ).toString("base64")}`,
    },
    data: new URLSearchParams({
      grant_type: "client_credentials",
      resource: logtoResource,
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
  const _accessToken = accessToken ?? (await getLogtoAccessToken(request));

  await request.delete(`${logtoEndpoint}/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${_accessToken}`,
    },
  });
};
