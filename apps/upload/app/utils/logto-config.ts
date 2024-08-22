import {
  getBaseLogtoConfig,
  organizationScopes,
} from "auth/authentication-context";
import { AuthenticationContextConfig } from "auth/base-authentication-context";
import { logtoLogin } from "./routes";

export const uploadApiResource = process.env.UPLOAD_BACKEND_URL?.endsWith("/")
  ? process.env.UPLOAD_BACKEND_URL
  : `${process.env.UPLOAD_BACKEND_URL}/`;

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.UPLOAD_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_UPLOAD_APP_ID as string,
  appSecret: process.env.LOGTO_UPLOAD_APP_SECRET as string,
};

const organizationId = "ogcio";
export const citizenScopes = ["upload:file.self:read"];
export const publicServantScopes = ["upload:file:*"];
const publicServantExpectedRole = "File Upload Public Servant";

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl: baseConfig.baseUrl,
    appId: baseConfig.appId,
    appSecret: baseConfig.appSecret,
    organizationId,
    citizenScopes,
    publicServantExpectedRoles: [publicServantExpectedRole],
    publicServantScopes,
    loginUrl: logtoLogin.url,
    resourceUrl: uploadApiResource,
  });

export const postSignoutRedirect = process.env.UPLOAD_ENTRY_POINT;

export const getSignInConfiguration = () => ({
  ...getBaseLogtoConfig(),
  ...baseConfig,
  // All the available resources to the app
  resources: [uploadApiResource],
  scopes: [...organizationScopes, ...citizenScopes, ...publicServantScopes],
});
