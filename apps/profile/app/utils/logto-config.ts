import {
  getBaseLogtoConfig,
  organizationScopes,
} from "auth/authentication-context";
import { logto } from "./routes";
import { AuthenticationContextConfig } from "auth/base-authentication-context";

export const profileApiResource = process.env.PROFILE_BACKEND_URL?.endsWith("/")
  ? process.env.PROFILE_BACKEND_URL
  : `${process.env.PROFILE_BACKEND_URL}/`;
const baseUrl = process.env.NEXT_PUBLIC_PROFILE_SERVICE_ENTRY_POINT as string;
const appId = process.env.LOGTO_PROFILE_APP_ID as string;
const appSecret = process.env.LOGTO_PROFILE_APP_SECRET as string;
const organizationId = "ogcio";
const citizenScopes = [
  "profile:user.self:read",
  "profile:user.self:write",
  "profile:address.self:read",
  "profile:address.self:write",
  "profile:entitlement.self:read",
  "profile:entitlement.self:write",
];
const publicServantScopes = [
  "profile:user:*",
  "profile:address:*",
  "profile:entitlement:*",
];
const publicServantExpectedRole = "ogcio:Profile Public Servant";

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl,
    appId,
    appSecret,
    organizationId,
    citizenScopes,
    publicServantExpectedRole,
    publicServantScopes,
    loginUrl: logto.login.path(),
    resourceUrl: profileApiResource,
  });

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_PROFILE_SERVICE_ENTRY_POINT;

export const getSignInConfiguration = () => ({
  ...getBaseLogtoConfig(),
  baseUrl: process.env.NEXT_PUBLIC_PROFILE_SERVICE_ENTRY_POINT as string,
  appId: process.env.LOGTO_PROFILE_APP_ID as string,
  appSecret: process.env.LOGTO_PROFILE_APP_SECRET as string,
  // All the available resources to the app
  resources: [profileApiResource],
  scopes: [...organizationScopes, ...citizenScopes, ...publicServantScopes],
});
