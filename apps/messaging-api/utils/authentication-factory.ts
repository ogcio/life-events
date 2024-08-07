import { getAccessToken, getOrganizationToken } from "api-auth";
import { Profile } from "building-blocks-sdk";
import { AuthorizationError } from "shared-errors";

const getBaseProfileConfig = (): {
  logtoOidcEndpoint: string;
  applicationId: string;
  applicationSecret: string;
} => ({
  logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
  applicationId: process.env.LOGTO_M2M_PROFILE_APP_ID ?? "",
  applicationSecret: process.env.LOGTO_M2M_PROFILE_APP_SECRET ?? "",
});

const getOrganizationProfileToken = (organizationId: string): Promise<string> =>
  getOrganizationToken({
    ...getBaseProfileConfig(),
    scopes: ["profile:user:read"],
    organizationId,
  });

const getCitizenProfileToken = (): Promise<string> =>
  getAccessToken({
    ...getBaseProfileConfig(),
    scopes: ["profile:user.self:read"],
    resource: process.env.PROFILE_BACKEND_URL?.endsWith("/")
      ? process.env.PROFILE_BACKEND_URL
      : `${process.env.PROFILE_BACKEND_URL}/`,
  });

export const getProfileSdk = async (
  organizationId?: string,
): Promise<Profile> => {
  const token = await (organizationId
    ? getOrganizationProfileToken(organizationId)
    : getCitizenProfileToken());

  return new Profile(token);
};

export const ensureUserIdIsSet = (
  request: { userData?: { userId?: string } },
  errorProcess: string,
  errorMessage: string = "User id is not set",
): string => {
  if (request.userData && request.userData.userId) {
    return request.userData.userId;
  }

  throw new AuthorizationError(errorProcess, errorMessage);
};

export const ensureOrganizationIdIsSet = (
  request: { userData?: { organizationId?: string } },
  errorProcess: string,
  errorMessage: string = "Organization id is not set",
): string => {
  if (request.userData && request.userData.organizationId) {
    return request.userData.organizationId;
  }

  throw new AuthorizationError(errorProcess, errorMessage);
};
