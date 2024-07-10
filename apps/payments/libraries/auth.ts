import { AuthSession } from "auth/auth-session";
import {
  baseConfig,
  citizenScopes,
  commonScopes,
  orgScopes,
  paymentsApiResource,
  paymentsPublicServantScopes,
} from "./logtoConfig";

const publicServantExpectedRole = "ogcio:Payments Public Servant";
const organizationId = "ogcio";

export const getAuthenticationContext = async (): Promise<any> => {
  const citizenContext = await getPaymentsCitizenContext();
  if (citizenContext.isPublicServant) {
    return getPaymentsPublicServantContext();
  }

  return citizenContext;
};

export const getPaymentsCitizenContext = () =>
  AuthSession.get(
    {
      ...baseConfig,
      resources: [paymentsApiResource],
      scopes: [...commonScopes, ...citizenScopes],
    },
    {
      getAccessToken: true,
      fetchUserInfo: true,
      resource: paymentsApiResource,
      userType: "citizen",
      publicServantExpectedRole,
      loginUrl: "/login",
    },
  );

export const getPaymentsPublicServantContext = () =>
  AuthSession.get(
    {
      ...baseConfig,
      scopes: [...commonScopes, ...orgScopes, ...paymentsPublicServantScopes],
    },
    {
      getOrganizationToken: true,
      fetchUserInfo: true,
      userType: "publicServant",
      publicServantExpectedRole,
      organizationId,
      loginUrl: "/login",
    },
  );
