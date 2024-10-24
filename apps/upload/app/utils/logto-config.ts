import {
  getBaseLogtoConfig,
  organizationScopes,
} from "auth/authentication-context";
import { AuthenticationContextConfig } from "auth/base-authentication-context";
import { logtoLogin } from "./routes";

export const uploadApiResource = process.env.UPLOAD_BACKEND_URL?.endsWith("/")
  ? process.env.UPLOAD_BACKEND_URL
  : `${process.env.UPLOAD_BACKEND_URL}/`;

export const profileApiResource = process.env.PROFILE_BACKEND_URL?.endsWith("/")
  ? process.env.PROFILE_BACKEND_URL
  : `${process.env.PROFILE_BACKEND_URL}/`;

const uploadEntryPoint = (
  process.env.NEXT_PUBLIC_UPLOAD_SERVICE_ENTRY_POINT?.endsWith("/")
    ? process.env.NEXT_PUBLIC_UPLOAD_SERVICE_ENTRY_POINT.substring(
        0,
        process.env.NEXT_PUBLIC_UPLOAD_SERVICE_ENTRY_POINT.length - 1,
      )
    : process.env.NEXT_PUBLIC_UPLOAD_SERVICE_ENTRY_POINT
) as string;
const uploadEntryPointSlash = `${uploadEntryPoint}/` as string;

const appId = process.env.LOGTO_UPLOAD_APP_ID as string;
const appSecret = process.env.LOGTO_UPLOAD_APP_SECRET as string;
const organizationId = "ogcio";
export const citizenScopes = ["upload:file.self:read"];
export const publicServantScopes = ["upload:file:*", "profile:user:read"];
const publicServantExpectedRoles = ["File Upload Public Servant"];

export const getAuthenticationContextConfig =
  (): AuthenticationContextConfig => ({
    baseUrl: uploadEntryPointSlash,
    appId: appId,
    appSecret: appSecret,
    organizationId,
    citizenScopes,
    publicServantExpectedRoles,
    publicServantScopes,
    loginUrl: logtoLogin.url,
    resourceUrl: uploadApiResource,
  });

export const postSignoutRedirect = process.env.UPLOAD_ENTRY_POINT;

export const getSignInConfiguration = () => ({
  ...getBaseLogtoConfig(),
  baseUrl: uploadEntryPoint,
  appId,
  appSecret,
  // All the available resources to the app
  resources: [uploadApiResource, profileApiResource],
  scopes: [...organizationScopes, ...citizenScopes, ...publicServantScopes],
});
