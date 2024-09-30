import { getAccessToken, getOrganizationToken } from "api-auth";
import { Integrator, Profile } from "building-blocks-sdk";

const getBaseProfileConfig = (): {
  logtoOidcEndpoint: string;
  applicationId: string;
  applicationSecret: string;
} => ({
  logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
  applicationId: process.env.LOGTO_M2M_PROFILE_APP_ID ?? "",
  applicationSecret: process.env.LOGTO_M2M_PROFILE_APP_SECRET ?? "",
});

const getIntegratorBaseConfig = (): {
  logtoOidcEndpoint: string;
  applicationId: string;
  applicationSecret: string;
} => ({
  logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
  applicationId: process.env.LOGTO_M2M_INTEGRATOR_APP_ID ?? "",
  applicationSecret: process.env.LOGTO_M2M_INTEGRATOR_APP_SECRET ?? "",
});

const getOrganizationProfileToken = (organizationId: string): Promise<string> =>
  getOrganizationToken({
    ...getBaseProfileConfig(),
    scopes: ["profile:user:read"],
    organizationId,
  });

const getCitizenIntegrationToken = (): Promise<string> =>
  getAccessToken({
    ...getIntegratorBaseConfig(),
    scopes: ["integrator:journey:read"],
    resource: `${process.env.INTEGRATOR_BACKEND_URL}/`,
  });

export const getProfileSdk = async (
  organizationId: string,
): Promise<Profile> => {
  const token = await getOrganizationProfileToken(organizationId);
  return new Profile(token);
};

export const getIntegratorSdk = async (): Promise<Integrator> => {
  const token = await getCitizenIntegrationToken();
  return new Integrator(token);
};
