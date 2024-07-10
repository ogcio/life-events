import { AuthSession, AuthUserScope } from "auth/auth-session";
import { AuthSessionContext } from "auth/types";
import { AuthenticationError } from "shared-errors";
import { getServerLogger } from "nextjs-logging-wrapper";
import { notFound } from "next/navigation";

const ERROR_PROCESS = "AUTHENTICATION_CONTEXT";

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_MESSAGING_APP_ID as string,
  appSecret: process.env.LOGTO_MESSAGING_APP_SECRET as string,
};

const orgScopes = [
  AuthUserScope.Organizations,
  AuthUserScope.OrganizationRoles,
];

export const getAuthenticationContext = async (params: {
  resourceUrl: URL;
  citizenScopes: string[];
  publicServantScopes: string[];
  organizationId: string;
  loginUrl: string;
  publicServantExpectedRole: string;
  baseUrl: string;
  appId: string;
  appSecret: string;
}): Promise<AuthSessionContext> => {
  let context = await getCitizenContext({ ...params });
  if (context.isPublicServant) {
    context = await getPublicServantContext({ ...params });
  }

  if (!context.accessToken) {
    getServerLogger().error({
      error: new AuthenticationError(ERROR_PROCESS, "Missing access token"),
    });
    throw notFound();
  }
  if (!context.user) {
    getServerLogger().error({
      error: new AuthenticationError(ERROR_PROCESS, "Missing user"),
    });
    throw notFound();
  }

  return context as AuthSessionContext;
};

export const getCitizenContext = (params: {
  resourceUrl: URL;
  citizenScopes: string[];
  loginUrl: string;
  publicServantExpectedRole: string;
  baseUrl: string;
  appId: string;
  appSecret: string;
}) =>
  AuthSession.get(
    {
      ...baseConfig,
      baseUrl: params.baseUrl,
      appId: params.appId,
      appSecret: params.appSecret,
      resources: [params.resourceUrl.toString()],
      scopes: [...params.citizenScopes],
    },
    {
      getAccessToken: true,
      resource: params.resourceUrl.toString(),
      fetchUserInfo: true,
      publicServantExpectedRole: params.publicServantExpectedRole,
      userType: "citizen",
      loginUrl: params.loginUrl,
    },
  );

export const getPublicServantContext = (params: {
  resourceUrl: URL;
  citizenScopes: string[];
  publicServantScopes: string[];
  organizationId: string;
  loginUrl: string;
  publicServantExpectedRole: string;
  baseUrl: string;
  appId: string;
  appSecret: string;
}) =>
  AuthSession.get(
    {
      ...baseConfig,
      baseUrl: params.baseUrl,
      appId: params.appId,
      appSecret: params.appSecret,
      scopes: [...orgScopes, ...params.publicServantScopes],
    },
    {
      getOrganizationToken: true,
      fetchUserInfo: true,
      publicServantExpectedRole: params.publicServantExpectedRole,
      organizationId: params.organizationId,
      userType: "publicServant",
      loginUrl: params.loginUrl,
    },
  );

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT;
