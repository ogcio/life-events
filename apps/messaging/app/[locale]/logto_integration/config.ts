import { AuthUserScope } from "auth/auth-session";

export const messagingApiResource = process.env.MESSAGES_BACKEND_URL + "/";

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

const citizenScopes = ["messaging:message.self:read"];
const publicServantScopes = [
  "messaging:message:*",
  "messaging:provider:*",
  "messaging:template:*",
  "messaging:citizen:*",
];

export default {
  ...baseConfig,
  // All the available resources to the app
  resources: [messagingApiResource],
  scopes: [...orgScopes, ...citizenScopes, ...publicServantScopes],
};

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT;
