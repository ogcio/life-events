import { getOrganizationToken } from "api-auth";

export const getTokenForMessaging = (organizationId: string): Promise<string> =>
  getOrganizationToken({
    logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
    applicationId: process.env.LOGTO_MESSAGING_APP_ID ?? "",
    applicationSecret: process.env.LOGTO_MESSAGING_APP_SECRET ?? "",
    scopes: [
      "messaging:message:*",
      "messaging:provider:*",
      "messaging:template:*",
      "messaging:citizen:*",
      "messaging:event:read",
      "profile:user:read",
    ],
    organizationId,
  });
