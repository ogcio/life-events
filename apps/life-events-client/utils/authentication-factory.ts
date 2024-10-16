import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { Messaging } from "building-blocks-sdk";
import { headers } from "next/headers";
import { Profile } from "building-blocks-sdk";

import {
  getBaseLogtoConfig,
  organizationScopes,
} from "auth/authentication-context";

import { AuthenticationContextConfig } from "auth/base-authentication-context";

const logtoLogin = {
  url: "/login",
};

const logtoSignout = {
  url: "/signout",
};

export const messagingApiResource = process.env.LEA_BACKEND_URL?.endsWith(
  "/",
)
  ? process.env.LEA_BACKEND_URL
  : `${process.env.LEA_BACKEND_URL}/`;

export const profileApiResource = process.env.PROFILE_BACKEND_URL?.endsWith("/")
  ? process.env.PROFILE_BACKEND_URL
  : `${process.env.PROFILE_BACKEND_URL}/`;

const messagingEntryPoint = (
  process.env.NEXT_PUBLIC_LEA_SERVICE_ENTRY_POINT?.endsWith("/")
    ? process.env.NEXT_PUBLIC_LEA_SERVICE_ENTRY_POINT.substring(
        0,
        process.env.NEXT_PUBLIC_LEA_SERVICE_ENTRY_POINT.length - 1,
      )
    : process.env.NEXT_PUBLIC_LEA_SERVICE_ENTRY_POINT
) as string;
const messagingEntryPointSlash = `${messagingEntryPoint}/` as string;
const appId = process.env.LOGTO_LEA_APP_ID as string;
const appSecret = process.env.LOGTO_LEA_APP_SECRET as string;
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
    publicServantExpectedRoles,
    publicServantScopes,
    loginUrl: logtoLogin.url,
    resourceUrl: profileApiResource,
  });

export const postSignoutRedirect = messagingEntryPoint;

export const getSignInConfiguration = () => ({
  ...getBaseLogtoConfig(),
  baseUrl: messagingEntryPoint,
  appId: process.env.LOGTO_LEA_APP_ID as string,
  appSecret: process.env.LOGTO_LEA_APP_SECRET as string,
  // All the available resources to the app
  resources: [],
  scopes: [...organizationScopes, ...citizenScopes, ...publicServantScopes],
});

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getToken(): Promise<string> {
    // call a route handler that retrieves the cached token
    // we need to forward the cookie header or the request won't be authenticated
    const cookieHeader = headers().get("cookie") as string;

    const res = await fetch(
      new URL(
        "/api/token",
        process.env.NEXT_PUBLIC_LEA_SERVICE_ENTRY_POINT as string,
      ),
      { headers: { cookie: cookieHeader } },
    );
    const { token } = await res.json();
    return token;
  }

  static async getMessagingClient(): Promise<Messaging> {
    const token = await this.getToken();
    return new Messaging(token);
  }
}

export class ProfileAuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(
      getProfileAuthenticationContextConfig(),
    );
  }

  static async getToken(): Promise<string> {
    // call a route handler that retrieves the cached token
    // we need to forward the cookie header or the request won't be authenticated
    const cookieHeader = headers().get("cookie") as string;

    const res = await fetch(
      new URL(
        "/api/profile-token",
        process.env.NEXT_PUBLIC_LEA_SERVICE_ENTRY_POINT as string,
      ),
      { headers: { cookie: cookieHeader } },
    );
    const { token } = await res.json();
    return token;
  }

  static async getProfileClient(): Promise<Profile> {
    const token = await this.getToken();
    return new Profile(token);
  }
}
