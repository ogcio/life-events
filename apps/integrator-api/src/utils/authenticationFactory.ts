import { getOrganizationToken } from "api-auth";
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

export const getProfileSdk = async (
  organizationId: string,
): Promise<Profile> => {
  const token = await getOrganizationProfileToken(organizationId);
  return new Profile(token);
};
