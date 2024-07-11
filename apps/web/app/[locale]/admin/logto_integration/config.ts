import { AuthSession, AuthUserScope } from "auth/auth-session";
import { AuthSessionContext } from "auth/types";

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.LIFE_EVENTS_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_LIFE_EVENTS_APP_ID as string,
  appSecret: process.env.LOGTO_LIFE_EVENTS_APP_SECRET as string,
};

const organizationId = "ogcio";

const orgScopes = [
  AuthUserScope.Organizations,
  AuthUserScope.OrganizationRoles,
];

// TODO: TBD
const citizenScopes = [];
const publicServantScopes = ["life-events:digital-wallet-flow:*"];

const publicServantExpectedRole = "ogcio:Life Events Public Servant";

export default {
  ...baseConfig,
  // All the available resources to the app
  resources: [],
  scopes: [...orgScopes, ...citizenScopes, ...publicServantScopes],
};

export const getAuthenticationContext =
  async (): Promise<AuthSessionContext> => {
    return getPublicServantContext();
  };

export const authConfig = {
  ...baseConfig,
  scopes: [...orgScopes, ...publicServantScopes],
};

const getPublicServantContext = () =>
  AuthSession.get(authConfig, {
    loginUrl: "/admin/logto_integration/login",
    getOrganizationToken: true,
    fetchUserInfo: true,
    publicServantExpectedRole,
    organizationId: organizationId,
    userType: "publicServant",
  });

export const postSignoutRedirect = process.env.LIFE_EVENTS_ADMIN_ENTRY_POINT;
