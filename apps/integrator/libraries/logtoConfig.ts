import { AuthenticationContextConfig } from "auth/base-authentication-context";
import { organizationScopes } from "auth/authentication-context";
import { headers } from "next/headers";

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.HOST_URL as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_INTEGRATOR_APP_ID as string,
  appSecret: process.env.LOGTO_INTEGRATOR_APP_SECRET as string,
};

const publicServantExpectedRoles = ["Integrator Public Servant"];

const buildLoginUrlWithPostLoginRedirect = () => {
  const currentPath = headers().get("x-url");
  return `/preLogin?loginUrl=/login&postLoginRedirectUrl=${encodeURIComponent(currentPath ?? "")}`;
};

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl: baseConfig.baseUrl,
    appId: baseConfig.appId,
    appSecret: baseConfig.appSecret,
    citizenScopes: [],
    publicServantExpectedRoles,
    publicServantScopes: [...profileApiScopes],
    loginUrl: buildLoginUrlWithPostLoginRedirect(),
    resourceUrl: "",
  });

export const postSignoutRedirect = process.env.HOST_URL;

export const integratorPublicServantScopes = [
  "integrator:journey:*",
  "integrator:step:*",
  "integrator:run:read",
];

export const getSignInConfiguration = () => ({
  ...baseConfig,
  resources: [],
  scopes: [
    ...organizationScopes,
    ...integratorPublicServantScopes,
    ...profileApiScopes,
  ],
});

export const postLoginRedirectUrlCookieName = "logtoPostLoginRedirectUrl";

export const logtoUserIdCookieName = "logtoUserId";

// Profile API
export const profileApiResource = process.env.PROFILE_BACKEND_URL?.endsWith("/")
  ? process.env.PROFILE_BACKEND_URL
  : `${process.env.PROFILE_BACKEND_URL}/`;

const profileApiScopes = ["profile:user:*"];

export const getProfileAuthenticationContextConfig = (
  organizationId,
): AuthenticationContextConfig => ({
  baseUrl: baseConfig.baseUrl,
  appId: baseConfig.appId,
  appSecret: baseConfig.appSecret,
  citizenScopes: [],
  organizationId,
  publicServantExpectedRoles,
  publicServantScopes: profileApiScopes,
  loginUrl: buildLoginUrlWithPostLoginRedirect(),
  resourceUrl: profileApiResource,
});
