import { AuthSession, AuthUserScope } from "auth/auth-session";
import { PartialAuthSessionContext } from "auth/types";

export const getBaseLogtoConfig = () => ({
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_MESSAGING_APP_ID as string,
  appSecret: process.env.LOGTO_MESSAGING_APP_SECRET as string,
});

const orgScopes = [
  AuthUserScope.Organizations,
  AuthUserScope.OrganizationRoles,
];

export const getCitizenContext = (params: {
  resourceUrl: string;
  citizenScopes: string[];
  loginUrl: string;
  publicServantExpectedRole: string;
  baseUrl: string;
  appId: string;
  appSecret: string;
}): Promise<PartialAuthSessionContext> =>
  AuthSession.get(
    {
      ...getBaseLogtoConfig(),
      baseUrl: params.baseUrl,
      appId: params.appId,
      appSecret: params.appSecret,
      resources: [params.resourceUrl],
      scopes: [...params.citizenScopes],
    },
    {
      getAccessToken: true,
      resource: params.resourceUrl,
      fetchUserInfo: true,
      publicServantExpectedRole: params.publicServantExpectedRole,
      userType: "citizen",
      loginUrl: params.loginUrl,
    },
  );

export const getPublicServantContext = (params: {
  resourceUrl: string;
  publicServantScopes: string[];
  organizationId: string;
  loginUrl: string;
  publicServantExpectedRole: string;
  baseUrl: string;
  appId: string;
  appSecret: string;
}): Promise<PartialAuthSessionContext> =>
  AuthSession.get(
    {
      ...getBaseLogtoConfig(),
      baseUrl: params.baseUrl,
      appId: params.appId,
      appSecret: params.appSecret,
      scopes: [...orgScopes, ...params.publicServantScopes],
      resources: [params.resourceUrl],
    },
    {
      getOrganizationToken: true,
      fetchUserInfo: true,
      publicServantExpectedRole: params.publicServantExpectedRole,
      organizationId: params.organizationId,
      userType: "publicServant",
      loginUrl: params.loginUrl,
      resource: params.resourceUrl,
    },
  );
