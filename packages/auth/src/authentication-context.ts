import { AuthSession, AuthUserScope } from "auth/auth-session";
import { PartialAuthSessionContext } from "auth/types";

export const getBaseLogtoConfig = () => ({
  cookieSecure: process.env.NODE_ENV === "production",
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,
});

export const organizationScopes = [
  AuthUserScope.Organizations,
  AuthUserScope.OrganizationRoles,
];

interface PublicServantParameters {
  resourceUrl?: string;
  publicServantScopes: string[];
  organizationId?: string;
  loginUrl: string;
  publicServantExpectedRoles: string[];
  baseUrl: string;
  appId: string;
  appSecret: string;
}

interface CitizenParameters {
  resourceUrl?: string;
  citizenScopes: string[];
  loginUrl: string;
  publicServantExpectedRoles: string[];
  baseUrl: string;
  appId: string;
  appSecret: string;
}

export const getCitizenContext = (
  params: CitizenParameters,
): Promise<PartialAuthSessionContext> =>
  AuthSession.get(
    buildCitizenAuthConfig(params),
    buildCitizenContextParameters(params),
  );

export const getPublicServantContext = (
  params: PublicServantParameters,
): Promise<PartialAuthSessionContext> =>
  AuthSession.get(
    buildPublicServantAuthConfig(params),
    buildPublicServantContextParameters(params),
  );

export const isPublicServantAuthenticated = (params: PublicServantParameters) =>
  AuthSession.isAuthenticated(
    buildPublicServantAuthConfig(params),
    buildPublicServantContextParameters(params),
  );

export const isCitizenAuthenticated = (params: CitizenParameters) =>
  AuthSession.isAuthenticated(
    buildCitizenAuthConfig(params),
    buildCitizenContextParameters(params),
  );

export const getSelectedOrganization = () =>
  AuthSession.getSelectedOrganization();

export const setSelectedOrganization = (organizationId) =>
  AuthSession.setSelectedOrganization(organizationId);

const buildPublicServantAuthConfig = (params: PublicServantParameters) => ({
  ...getBaseLogtoConfig(),
  baseUrl: params.baseUrl,
  appId: params.appId,
  appSecret: params.appSecret,
  scopes: [...organizationScopes, ...params.publicServantScopes],
  resources: params.resourceUrl ? [params.resourceUrl] : [],
});

const buildPublicServantContextParameters = (
  params: PublicServantParameters,
) => ({
  getOrganizationToken: true,
  fetchUserInfo: true,
  publicServantExpectedRoles: params.publicServantExpectedRoles ?? [],
  organizationId: params.organizationId,
  userType: "publicServant" as "publicServant",
  loginUrl: params.loginUrl,
});

const buildCitizenAuthConfig = (params: CitizenParameters) => ({
  ...getBaseLogtoConfig(),
  baseUrl: params.baseUrl,
  appId: params.appId,
  appSecret: params.appSecret,
  resources: params.resourceUrl ? [params.resourceUrl] : [],
  scopes: [...params.citizenScopes],
});

const buildCitizenContextParameters = (params: CitizenParameters) => ({
  getAccessToken: true,
  resource: params.resourceUrl,
  fetchUserInfo: true,
  publicServantExpectedRoles: params.publicServantExpectedRoles ?? [],
  userType: "citizen" as "citizen",
  loginUrl: params.loginUrl,
});
