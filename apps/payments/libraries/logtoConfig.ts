import { AuthenticationContextConfig } from "auth/base-authentication-context";
import { AuthUserScope } from "auth/index";
import { routeDefinitions } from "../app/routeDefinitions";
import { organizationScopes } from "auth/authentication-context";
import { headers } from "next/headers";

export const paymentsApiResource = process.env.PAYMENTS_BACKEND_URL + "/";

export const publicServantExpectedRoles = ["Payments Public Servant"];

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

const buildLoginUrlWithPostLoginRedirect = () => {
  const currentPath = headers().get("x-url");
  return `${routeDefinitions.preLogin.path()}?loginUrl=${routeDefinitions.login.path()}&postLoginRedirectUrl=${encodeURIComponent(currentPath ?? "")}`;
};

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl: baseConfig.baseUrl,
    appId: baseConfig.appId,
    appSecret: baseConfig.appSecret,
    citizenScopes,
    publicServantExpectedRoles,
    publicServantScopes: paymentsPublicServantScopes,
    loginUrl: buildLoginUrlWithPostLoginRedirect(),
    resourceUrl: paymentsApiResource,
  });

export default {
  ...baseConfig,
  // All the available resources to the app
  resources: [paymentsApiResource],
  scopes: [
    ...commonScopes,
    ...organizationScopes,
    ...citizenScopes,
    ...paymentsPublicServantScopes,
  ],
};

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT;
export const postLoginRedirectUrlCookieName = "logtoPostLoginRedirectUrl";
