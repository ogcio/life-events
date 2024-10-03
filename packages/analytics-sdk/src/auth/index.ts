interface TokenResponseBody {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

const fetchToken = async (params: {
  logtoOidcEndpoint: string;
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
  const logtoOidcEndpoint = params.logtoOidcEndpoint.endsWith("/")
    ? params.logtoOidcEndpoint
    : `${params.logtoOidcEndpoint}/`;
  const response = await fetch(`${logtoOidcEndpoint}token`, {
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
    const errorResponse = await response.json();
    throw new Error(
      `Failed to get access token: ${JSON.stringify(errorResponse)}`,
    );
  }

  return response.json() as Promise<TokenResponseBody>;
};

export interface GetOrganizationTokenParams {
  logtoOidcEndpoint: string;
  applicationId: string;
  applicationSecret: string;
  scopes: string[];
  organizationId: string;
}

export const getOrganizationToken = async (
  params: GetOrganizationTokenParams,
): Promise<string> => {
  const tokenResponse = await fetchToken({
    ...params,
    scopes: [...params.scopes],
    specificBodyFields: { organization_id: params.organizationId },
  });
  return tokenResponse.access_token;
};
