import { AuthenticationContextConfig } from "auth/base-authentication-context";
import { AuthUserScope } from "auth/index";

export const paymentsApiResource = process.env.PAYMENTS_BACKEND_URL + "/";

export const orgScopes = [
  AuthUserScope.Organizations,
  AuthUserScope.OrganizationRoles,
];

export const publicServantExpectedRole = "ogcio:Payments Public Servant";
export const organizationId = "ogcio";

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_PAYMENTS_APP_ID as string,
  appSecret: process.env.LOGTO_PAYMENTS_APP_SECRET as string,
};

// All the permissions of a normal citizen
export const commonScopes = [AuthUserScope.Email];

export const citizenScopes = [
  "payments:provider.public:read",
  "payments:payment_request.public:read",
  "payments:transaction.self:write",
  "payments:transaction.self:read",
];
export const paymentsPublicServantScopes = [
  "payments:payment_request:*",
  "payments:transaction:*",
  "payments:provider:*",
  "payments:payment_request.public:read",
];

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl: baseConfig.baseUrl,
    appId: baseConfig.appId,
    appSecret: baseConfig.appSecret,
    organizationId,
    citizenScopes,
    publicServantExpectedRole,
    publicServantScopes: paymentsPublicServantScopes,
    loginUrl: "/login",
    resourceUrl: paymentsApiResource,
  });

export default {
  ...baseConfig,
  // All the available resources to the app
  resources: [paymentsApiResource],
  scopes: [
    ...commonScopes,
    ...orgScopes,
    ...citizenScopes,
    ...paymentsPublicServantScopes,
  ],
};

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT;
