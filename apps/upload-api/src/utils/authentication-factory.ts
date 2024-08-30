import { getOrganizationToken } from "api-auth";
import { Scheduler } from "building-blocks-sdk";
import { AuthorizationError } from "shared-errors";

const getBaseSchedulerConfig = (): {
  logtoOidcEndpoint: string;
  applicationId: string;
  applicationSecret: string;
} => ({
  logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
  applicationId: process.env.LOGTO_M2M_SCHEDULER_APP_ID ?? "",
  applicationSecret: process.env.LOGTO_M2M_SCHEDULER_APP_SECRET ?? "",
});

const getOrganizationSchedulerToken = (
  organizationId: string,
): Promise<string> =>
  getOrganizationToken({
    ...getBaseSchedulerConfig(),
    scopes: ["scheduler:jobs:write"],
    organizationId,
  });

export const getSchedulerSdk = async (
  organizationId: string,
): Promise<Scheduler> => {
  const token = await getOrganizationSchedulerToken(organizationId);

  return new Scheduler(token);
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
