import { organizationScopes } from "auth/authentication-context";
import { AuthenticationContextConfig } from "auth/base-authentication-context";

export const publicServantExpectedRoles = [
  "Payments Public Servant",
  "Messaging Public Servant",
  "Life Events Public Servant",
  "Analytics Public Servant",
];

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_HOME_SERVICE_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_HOME_APP_ID as string,
  appSecret: process.env.LOGTO_HOME_APP_SECRET as string,
};

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl: baseConfig.baseUrl,
    appId: baseConfig.appId,
    appSecret: baseConfig.appSecret,
    citizenScopes: [],
    publicServantExpectedRoles,
    publicServantScopes: [],
    loginUrl: "/login",
  });

export default {
  ...baseConfig,
  // All the available resources to the app
  resources: [],
  scopes: [...organizationScopes],
};

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_HOME_SERVICE_ENTRY_POINT;
