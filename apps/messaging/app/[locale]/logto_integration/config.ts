import {
  getBaseLogtoConfig,
  organizationScopes,
} from "auth/authentication-context";
import { logtoLogin } from "../../utils/routes";
import { AuthenticationContextConfig } from "auth/authentication-context-factory";

export const messagingApiResource = process.env.MESSAGES_BACKEND_URL + "/";
const baseUrl = process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string;
const appId = process.env.LOGTO_MESSAGING_APP_ID as string;
const appSecret = process.env.LOGTO_MESSAGING_APP_SECRET as string;
const organizationId = "ogcio";
const citizenScopes = ["messaging:message.self:read"];
const publicServantScopes = [
  "messaging:message:*",
  "messaging:provider:*",
  "messaging:template:*",
  "messaging:citizen:*",
];
const publicServantExpectedRole = "ogcio:Messaging Public Servant";

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
  // All the available resources to the app
  resources: [messagingApiResource],
  scopes: [...organizationScopes, ...citizenScopes, ...publicServantScopes],
});
