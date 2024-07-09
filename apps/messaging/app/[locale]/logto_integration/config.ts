import { AuthSession, AuthUserScope } from "auth/auth-session";
import { AuthSessionContext } from "auth/types";
import { AuthenticationError } from "shared-errors";
import { getServerLogger } from "nextjs-logging-wrapper";
import { notFound } from "next/navigation";
import { logtoLogin } from "../../utils/routes";

export const messagingApiResource = process.env.MESSAGES_BACKEND_URL + "/";

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_MESSAGING_APP_ID as string,
  appSecret: process.env.LOGTO_MESSAGING_APP_SECRET as string,
};

const organizationId = "ogcio";

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

const publicServantExpectedRole = "ogcio:Messaging Public Servant";

export default {
  ...baseConfig,
  // All the available resources to the app
  resources: [messagingApiResource],
  scopes: [...orgScopes, ...citizenScopes, ...publicServantScopes],
};

export const getAuthenticationContext =
  async (): Promise<AuthSessionContext> => {
    let context = await getCitizenContext();
    if (context.isPublicServant) {
      context = await getPublicServantContext();
    }

    if (!context.accessToken) {
      getServerLogger().error({
        error: new AuthenticationError(
          "AUTHENTICATION_CONTEXT",
          "Missing access token",
        ),
      });
      throw notFound();
    }
    if (!context.user) {
      getServerLogger().error({
        error: new AuthenticationError(
          "AUTHENTICATION_CONTEXT",
          "Missing user",
        ),
      });
      throw notFound();
    }

    return context as AuthSessionContext;
  };

const getCitizenContext = () =>
  AuthSession.get(
    {
      ...baseConfig,
      resources: [messagingApiResource],
      scopes: [...citizenScopes],
    },
    {
      getAccessToken: true,
      resource: messagingApiResource,
      fetchUserInfo: true,
      publicServantExpectedRole,
      userType: "citizen",
      loginUrl: logtoLogin.url,
    },
  );

const getPublicServantContext = () =>
  AuthSession.get(
    {
      ...baseConfig,
      scopes: [...orgScopes, ...publicServantScopes],
    },
    {
      getOrganizationToken: true,
      fetchUserInfo: true,
      publicServantExpectedRole,
      organizationId: organizationId,
      userType: "publicServant",
      loginUrl: logtoLogin.url,
    },
  );

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT;
