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
const baseUrl = process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string;
const appId = process.env.LOGTO_MESSAGING_APP_ID as string;
const appSecret = process.env.LOGTO_MESSAGING_APP_SECRET as string;
const organizationId = "ogcio";
const citizenScopes = [
  "messaging:message.self:read",
  "messaging:citizen.self:read",
  "messaging:citizen.self:write",
];
const publicServantScopes = [
  "messaging:message:*",
  "messaging:provider:*",
  "messaging:template:*",
  "messaging:citizen:*",
  "messaging:event:read",
];
const publicServantExpectedRole = "Messaging Public Servant";

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl,
    appId,
    appSecret,
    organizationId,
    citizenScopes,
    publicServantExpectedRole,
    publicServantScopes,
    loginUrl: logtoLogin.url,
    resourceUrl: messagingApiResource,
  });

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT;

export const getSignInConfiguration = () => ({
  ...getBaseLogtoConfig(),
  baseUrl: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
  appId: process.env.LOGTO_MESSAGING_APP_ID as string,
  appSecret: process.env.LOGTO_MESSAGING_APP_SECRET as string,
  // All the available resources to the app
  resources: [messagingApiResource],
  scopes: [...organizationScopes, ...citizenScopes, ...publicServantScopes],
});
