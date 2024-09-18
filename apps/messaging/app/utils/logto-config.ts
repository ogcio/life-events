import {
  getBaseLogtoConfig,
  organizationScopes,
} from "auth/authentication-context";
import { logtoLogin } from "./routes";
import { AuthenticationContextConfig } from "auth/base-authentication-context";

export const messagingApiResource = process.env.MESSAGES_BACKEND_URL?.endsWith(
  "/",
)
  ? process.env.MESSAGES_BACKEND_URL
  : `${process.env.MESSAGES_BACKEND_URL}/`;

export const profileApiResource = process.env.PROFILE_BACKEND_URL?.endsWith("/")
  ? process.env.PROFILE_BACKEND_URL
  : `${process.env.PROFILE_BACKEND_URL}/`;

const baseUrl = process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string;
const appId = process.env.LOGTO_MESSAGING_APP_ID as string;
const appSecret = process.env.LOGTO_MESSAGING_APP_SECRET as string;
const organizationId = "ogcio";
const citizenScopes = [
  "messaging:message.self:read",
  "messaging:message.self:write",
  "messaging:citizen.self:read",
  "messaging:citizen.self:write",
  "profile:user.self:write",
  "profile:user.self:read",
];
const publicServantScopes = [
  "messaging:message:*",
  "messaging:provider:*",
  "messaging:template:*",
  "messaging:citizen:*",
  "messaging:event:read",
];
const publicServantExpectedRoles = ["Messaging Public Servant"];

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl,
    appId,
    appSecret,
    organizationId,
    citizenScopes,
    publicServantExpectedRoles,
    publicServantScopes,
    loginUrl: logtoLogin.url,
    resourceUrl: messagingApiResource,
  });

export const getProfileAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl,
    appId,
    appSecret,
    organizationId,
    citizenScopes,
    publicServantExpectedRoles,
    publicServantScopes,
    loginUrl: logtoLogin.url,
    resourceUrl: profileApiResource,
  });

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT;

export const getSignInConfiguration = () => ({
  ...getBaseLogtoConfig(),
  baseUrl: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
  appId: process.env.LOGTO_MESSAGING_APP_ID as string,
  appSecret: process.env.LOGTO_MESSAGING_APP_SECRET as string,
  // All the available resources to the app
  resources: [messagingApiResource, profileApiResource],
  scopes: [...organizationScopes, ...citizenScopes, ...publicServantScopes],
});
