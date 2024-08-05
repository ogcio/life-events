import { getAccessToken, getOrganizationToken } from "api-auth";
import { Profile } from "building-blocks-sdk";

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
