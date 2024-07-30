import { UserScope } from "@logto/node";
import { AuthenticationError } from "shared-errors";
interface GetTokenBaseParams {
  logtoEndpoint: string;
  applicationId: string;
  applicationSecret: string;
  scopes: string[];
}
export interface GetOrganisationTokenParams extends GetTokenBaseParams {
  organizationId: string;
}

export interface GetAccessTokenParams extends GetTokenBaseParams {
  resource: string;
}

interface TokenResponseBody {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export const getOrganisationToken = async (
  params: GetOrganisationTokenParams,
): Promise<string> => {
  const tokenResponse = await fetchToken({
    ...params,
    scopes: [
      ...params.scopes,
      UserScope.OrganizationRoles,
      UserScope.Organizations,
    ],
    specificBodyFields: { organization_id: params.organizationId },
  });
  //TODO store here
  return tokenResponse.access_token;
};

export const getAccessToken = async (
  params: GetAccessTokenParams,
): Promise<string> => {
  const tokenResponse = await fetchToken({
    ...params,
    specificBodyFields: { resource: params.resource },
  });
  //TODO store here
  return tokenResponse.access_token;
};

const fetchToken = async (params: {
  logtoEndpoint: string;
  applicationId: string;
  applicationSecret: string;
  scopes: string[];
  specificBodyFields: { [x: string]: string };
}): Promise<TokenResponseBody> => {
  const body = {
    ...params.specificBodyFields,
    scope: params.scopes.join(" "),
    grant_type: "client_credentials",
  };

  const response = await fetch(`${params.logtoEndpoint}/oidc/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${params.applicationId}:${params.applicationSecret}`,
      ).toString("base64")}`,
    },
    body: new URLSearchParams(body).toString(),
  });

  if (response.status !== 200) {
    throw new AuthenticationError(
      "GET_ACCESS_TOKEN",
      JSON.stringify(await response.json()),
    );
  }

  return response.json() as Promise<TokenResponseBody>;
};
