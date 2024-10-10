import { getAccessToken, getOrganizationToken } from "api-auth";
import { Profile, Scheduler, Upload } from "building-blocks-sdk";
import { httpErrors } from "@fastify/sensible";

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
    scopes: ["profile:user:read"],
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

const getOrganizationSchedulerToken = (
  organizationId: string,
): Promise<string> =>
  getOrganizationToken({
    logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
    applicationId: process.env.LOGTO_M2M_SCHEDULER_APP_ID ?? "",
    applicationSecret: process.env.LOGTO_M2M_SCHEDULER_APP_SECRET ?? "",
    scopes: ["scheduler:jobs:write"],
    organizationId,
  });

export const getSchedulerSdk = async (
  organizationId: string,
): Promise<Scheduler> => {
  const token = await getOrganizationSchedulerToken(organizationId);

  return new Scheduler(token);
};

export const ensureUserIdIsSet = (request: {
  userData?: { userId?: string };
}): string => {
  if (request.userData && request.userData.userId) {
    return request.userData.userId;
  }

  throw httpErrors.forbidden("User id is not set");
};

export const ensureOrganizationIdIsSet = (request: {
  userData?: { organizationId?: string };
}): string => {
  if (request.userData && request.userData.organizationId) {
    return request.userData.organizationId;
  }

  throw httpErrors.forbidden("Organization id is not set");
};

const getOrganizationUploadToken = (organizationId: string): Promise<string> =>
  getOrganizationToken({
    logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
    applicationId: process.env.LOGTO_M2M_UPLOADER_APP_ID ?? "",
    applicationSecret: process.env.LOGTO_M2M_UPLOADER_APP_SECRET ?? "",
    scopes: ["upload:file:*"],
    organizationId,
  });

export const getUploadSdk = async (organizationId: string): Promise<Upload> => {
  const token = await getOrganizationUploadToken(organizationId);

  return new Upload(token);
};
