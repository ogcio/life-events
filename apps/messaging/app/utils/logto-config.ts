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

const messagingEntryPoint = (
  process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT?.endsWith("/")
    ? process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT.substring(
        0,
        process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT.length - 1,
      )
    : process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT
) as string;
const messagingEntryPointSlash = `${messagingEntryPoint}/` as string;
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
    baseUrl: messagingEntryPointSlash,
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
    baseUrl: messagingEntryPointSlash,
    appId,
    appSecret,
    organizationId,
    citizenScopes,
    publicServantExpectedRoles: ["Profile Public Servant"],
    publicServantScopes: ["profile:user:*"],
    loginUrl: logtoLogin.url,
    resourceUrl: profileApiResource,
  });

export const postSignoutRedirect = messagingEntryPoint;

export const getSignInConfiguration = () => ({
  ...getBaseLogtoConfig(),
  baseUrl: messagingEntryPoint,
  appId: process.env.LOGTO_MESSAGING_APP_ID as string,
  appSecret: process.env.LOGTO_MESSAGING_APP_SECRET as string,
  // All the available resources to the app
  resources: [messagingApiResource, profileApiResource],
  scopes: [...organizationScopes, ...citizenScopes, ...publicServantScopes],
});
