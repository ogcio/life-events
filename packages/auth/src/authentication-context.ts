import { AuthSession, AuthUserScope } from "auth/auth-session";
import { PartialAuthSessionContext } from "auth/types";
import { Logger } from "pino";

export const getBaseLogtoConfig = () => ({
  cookieSecure: process.env.NODE_ENV === "production",
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,
});

export const organizationScopes = [
  AuthUserScope.Organizations,
  AuthUserScope.OrganizationRoles,
];

interface PublicServantParameters {
  resourceUrl?: string;
  publicServantScopes: string[];
  organizationId?: string;
  loginUrl: string;
  publicServantExpectedRoles: string[];
  baseUrl: string;
  appId: string;
  appSecret: string;
}

interface CitizenParameters {
  resourceUrl?: string;
  citizenScopes: string[];
  loginUrl: string;
  publicServantExpectedRoles: string[];
  baseUrl: string;
  appId: string;
  appSecret: string;
}

export const getCitizenContext = async (
  params: CitizenParameters,
  logger: Logger,
): Promise<PartialAuthSessionContext> => {
  const citizenAuthConfig = buildCitizenAuthConfig(params);
  const contextParameters = buildCitizenContextParameters(params);
  logger.trace(
    {
      citizenAuthConfig: {
        endpoint: citizenAuthConfig.endpoint,
        resources: citizenAuthConfig.resources,
        cookieSecure: citizenAuthConfig.cookieSecure,
        scopes: citizenAuthConfig.scopes,
        baseUrl: citizenAuthConfig.baseUrl,
        appId: citizenAuthConfig.appId,
        isCookieSecretSet: citizenAuthConfig.cookieSecret?.length > 0,
      },
      contextParameters,
    },
    "Requesting citizen context",
  );
  try {
    const citizenContext = await AuthSession.get(
      citizenAuthConfig,
      contextParameters,
    );

    logger.trace(
      {
        isInactivePublicServant: citizenContext.isInactivePublicServant,
        isPublicServant: citizenContext.isPublicServant,
        userId: citizenContext.user?.id,
      },
      "Got citizen context",
    );

    return citizenContext;
  } catch (e) {
    logger.error({ error: e }, "Error getting citizen context");
    throw e;
  }
};

export const getPublicServantContext = async (
  params: PublicServantParameters,
  logger: Logger,
): Promise<PartialAuthSessionContext> => {
  const authConfig = buildPublicServantAuthConfig(params);
  const contextParameters = buildPublicServantContextParameters(params);
  logger.trace(
    {
      publicServantAuthConfig: {
        endpoint: authConfig.endpoint,
        resources: authConfig.resources,
        cookieSecure: authConfig.cookieSecure,
        scopes: authConfig.scopes,
        baseUrl: authConfig.baseUrl,
        appId: authConfig.appId,
        isCookieSecretSet: authConfig.cookieSecret?.length > 0,
      },
      contextParameters,
    },
    "Requesting public servant context",
  );
  try {
    const publicServantContext = await AuthSession.get(
      authConfig,
      contextParameters,
    );

    logger.trace(
      {
        isInactivePublicServant: publicServantContext.isInactivePublicServant,
        isPublicServant: publicServantContext.isPublicServant,
        userId: publicServantContext.user?.id,
      },
      "Got public servant context",
    );

    return publicServantContext;
  } catch (e) {
    logger.error({ error: e }, "Error getting public servant context");
    throw e;
  }
};

export const isPublicServantAuthenticated = async (
  params: PublicServantParameters,
  logger: Logger,
): Promise<boolean> => {
  const isUserAuthenticatedAsPublicServant = await AuthSession.isAuthenticated(
    buildPublicServantAuthConfig(params),
    buildPublicServantContextParameters(params),
  );

  if (!isUserAuthenticatedAsPublicServant) {
    logger.trace({}, "User is not authenticated as public servant");
    return false;
  }

  const publicServantContext = await getPublicServantContext(params, logger);
  const isPublicServant = publicServantContext.isPublicServant;
  logger.trace({ isPublicServant }, "Checking if user is public servant");

  return isPublicServant;
};

export const isAuthenticated = async (params: {
  appId: string;
  baseUrl: string;
}): Promise<boolean> => {
  return AuthSession.isAuthenticated({ ...getBaseLogtoConfig(), ...params });
};

export const isCitizenAuthenticated = async (
  params: CitizenParameters,
  logger: Logger,
): Promise<boolean> => {
  const isUserAuthenticatedAsCitizen = await AuthSession.isAuthenticated(
    buildCitizenAuthConfig(params),
    buildCitizenContextParameters(params),
  );
  if (!isUserAuthenticatedAsCitizen) {
    logger.trace({}, "User is not authenticated as citizen");
    return false;
  }

  const citizen = await getCitizenContext(params, logger);
  const isCitizen = !citizen.isPublicServant;
  logger.trace({ isCitizen }, "Checking if user is citizen");

  return isCitizen;
};

export const getSelectedOrganization = () =>
  AuthSession.getSelectedOrganization();

export const setSelectedOrganization = (organizationId) =>
  AuthSession.setSelectedOrganization(organizationId);

export const getCitizenToken = async (
  params: CitizenParameters,
  logger: Logger,
  resource?: string,
): Promise<string> => {
  const authConfig = buildCitizenAuthConfig(params);
  logger.trace(
    {
      citizenAuthConfig: {
        endpoint: authConfig.endpoint,
        resources: authConfig.resources,
        cookieSecure: authConfig.cookieSecure,
        scopes: authConfig.scopes,
        baseUrl: authConfig.baseUrl,
        appId: authConfig.appId,
        isCookieSecretSet: authConfig.cookieSecret?.length > 0,
      },
      resource,
    },
    "Requesting citizen token",
  );
  try {
    const token = await AuthSession.getCitizenToken(authConfig, resource);
    logger.trace({}, "Citizen token retrieved");

    return token;
  } catch (e) {
    logger.error({ error: e }, "Error getting citizen token");
    throw e;
  }
};

export const getOrgToken = async (
  params: PublicServantParameters,
  organizationId: string,
  logger: Logger,
): Promise<string> => {
  const authConfig = buildPublicServantAuthConfig(params);
  logger.trace(
    {
      citizenAuthConfig: {
        endpoint: authConfig.endpoint,
        resources: authConfig.resources,
        cookieSecure: authConfig.cookieSecure,
        scopes: authConfig.scopes,
        baseUrl: authConfig.baseUrl,
        appId: authConfig.appId,
        isCookieSecretSet: authConfig.cookieSecret?.length > 0,
      },
      organizationId,
    },
    "Requesting public servant token",
  );
  try {
    const token = await AuthSession.getOrgToken(
      buildPublicServantAuthConfig(params),
      organizationId,
    );
    logger.trace({}, "Public servant token retrieved!");
    return token;
  } catch (e) {
    logger.error({ error: e }, "Error getting public servant token");

    throw e;
  }
};

const buildPublicServantAuthConfig = (params: PublicServantParameters) => ({
  ...getBaseLogtoConfig(),
  baseUrl: params.baseUrl,
  appId: params.appId,
  appSecret: params.appSecret,
  scopes: [...organizationScopes, ...params.publicServantScopes],
  resources: params.resourceUrl ? [params.resourceUrl] : [],
});

const buildPublicServantContextParameters = (
  params: PublicServantParameters,
) => ({
  getOrganizationToken: false,
  fetchUserInfo: true,
  publicServantExpectedRoles: params.publicServantExpectedRoles ?? [],
  organizationId: params.organizationId,
  userType: "publicServant" as "publicServant",
  loginUrl: params.loginUrl,
});

const buildCitizenAuthConfig = (params: CitizenParameters) => ({
  ...getBaseLogtoConfig(),
  baseUrl: params.baseUrl,
  appId: params.appId,
  appSecret: params.appSecret,
  resources: params.resourceUrl ? [params.resourceUrl] : [],
  scopes: [...params.citizenScopes],
});

const buildCitizenContextParameters = (params: CitizenParameters) => ({
  getAccessToken: false,
  resource: params.resourceUrl,
  fetchUserInfo: true,
  publicServantExpectedRoles: params.publicServantExpectedRoles ?? [],
  userType: "citizen" as "citizen",
  loginUrl: params.loginUrl,
});
