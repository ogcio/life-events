import {
  getBaseLogtoConfig,
  organizationScopes,
} from "auth/authentication-context";
import { AuthenticationContextConfig } from "auth/base-authentication-context";
import { logtoLogin } from "./routes";

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.LIFE_EVENTS_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_LIFE_EVENTS_APP_ID as string,
  appSecret: process.env.LOGTO_LIFE_EVENTS_APP_SECRET as string,
};

const organizationId = "ogcio";
// TODO: TBD
const citizenScopes = [];
const publicServantScopes = ["life-events:digital-wallet-flow:*"];
const publicServantExpectedRole = "ogcio:Life Events Public Servant";

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl: baseConfig.baseUrl,
    appId: baseConfig.appId,
    appSecret: baseConfig.appSecret,
    organizationId,
    citizenScopes,
    publicServantExpectedRole,
    publicServantScopes,
    loginUrl: logtoLogin.url,
    resourceUrl: "",
  });

export const postSignoutRedirect = process.env.LIFE_EVENTS_ADMIN_ENTRY_POINT;

export const getSignInConfiguration = () => ({
  ...getBaseLogtoConfig(),
  ...baseConfig,
  // All the available resources to the app
  resources: [],
  scopes: [...organizationScopes, ...citizenScopes, ...publicServantScopes],
});
