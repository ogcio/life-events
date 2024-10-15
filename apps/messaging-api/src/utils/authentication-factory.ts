import getBuildingBlockSDK, {
  BuildingBlocksSDK,
  getM2MTokenFn,
} from "@ogcio/building-blocks-sdk";
import { httpErrors } from "@fastify/sensible";

const profileBackendUrl = process.env.PROFILE_BACKEND_URL?.endsWith("/")
  ? process.env.PROFILE_BACKEND_URL
  : `${process.env.PROFILE_BACKEND_URL}/`;

const sdkPerOrganisation: { [organizationId: string]: BuildingBlocksSDK } = {};
let sdkPerCitizen: BuildingBlocksSDK | undefined = undefined;

const getBaseProfileConfig = (): {
  logtoOidcEndpoint: string;
  applicationId: string;
  applicationSecret: string;
} => ({
  logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
  applicationId: process.env.LOGTO_M2M_PROFILE_APP_ID ?? "",
  applicationSecret: process.env.LOGTO_M2M_PROFILE_APP_SECRET ?? "",
});

export const getProfileSdk = async (organizationId?: string) => {
  return loadBuildingBlocksSdk(organizationId).profile;
};

export const getSchedulerSdk = async (organizationId: string) => {
  return loadBuildingBlocksSdk(organizationId).scheduler;
};

const servicesConfiguration = {
  scheduler: {
    baseUrl: process.env.SCHEDULER_BACKEND_URL,
  },
  profile: {
    baseUrl: process.env.PROFILE_BACKEND_URL,
  },
  upload: {
    baseUrl: process.env.UPLOAD_BACKEND_URL,
  },
};

const loadBuildingBlocksSdk = (organizationId?: string): BuildingBlocksSDK => {
  if (!organizationId) {
    if (!sdkPerCitizen) {
      sdkPerCitizen = getBuildingBlockSDK({
        services: servicesConfiguration,
        getTokenFn: getM2MTokenFn({
          services: {
            profile: {
              getAccessTokenParams: {
                resource: profileBackendUrl,
                scopes: ["profile:user.self:read"],
                ...getBaseProfileConfig(),
              },
            },
          },
        }),
      });
    }
    return sdkPerCitizen;
  }

  if (!sdkPerOrganisation[organizationId]) {
    sdkPerOrganisation[organizationId] = getBuildingBlockSDK({
      services: servicesConfiguration,
      getTokenFn: getM2MTokenFn({
        services: {
          profile: {
            getOrganizationTokenParams: {
              scopes: ["profile:user:read"],
              organizationId,
              ...getBaseProfileConfig(),
            },
          },
          scheduler: {
            getOrganizationTokenParams: {
              logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
              applicationId: process.env.LOGTO_M2M_SCHEDULER_APP_ID ?? "",
              applicationSecret:
                process.env.LOGTO_M2M_SCHEDULER_APP_SECRET ?? "",
              scopes: ["scheduler:jobs:write"],
              organizationId,
            },
          },
          upload: {
            getOrganizationTokenParams: {
              logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
              applicationId: process.env.LOGTO_M2M_UPLOADER_APP_ID ?? "",
              applicationSecret:
                process.env.LOGTO_M2M_UPLOADER_APP_SECRET ?? "",
              scopes: ["upload:file:*"],
              organizationId,
            },
          },
        },
      }),
    });
  }
  return sdkPerOrganisation[organizationId];
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

export const getUploadSdk = async (organizationId: string) => {
  return loadBuildingBlocksSdk(organizationId).upload;
};
