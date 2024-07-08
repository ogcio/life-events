import { AuthSession } from "auth/auth-session";
import {
  baseConfig,
  citizenScopes,
  orgScopes,
  paymentsApiResource,
  paymentsPublicServantScopes,
} from "./logtoConfig";

const publicServantExpectedRole = "Public Servant";
const organizationId = "ogcio";

export const getPaymentsCitizenContext = () =>
  AuthSession.get(
    {
      ...baseConfig,
      resources: [paymentsApiResource],
      scopes: [...citizenScopes],
    },
    {
      getAccessToken: true,
      fetchUserInfo: true,
      resource: paymentsApiResource,
      userType: "citizen",
      publicServantExpectedRole,
    },
  );

export const getPaymentsOrganizationContext = () =>
  AuthSession.get(
    {
      ...baseConfig,
      scopes: [...orgScopes, ...paymentsPublicServantScopes],
    },
    {
      getOrganizationToken: true,
      fetchUserInfo: true,
      userType: "publicServant",
      publicServantExpectedRole,
      organizationId,
    },
  );

export const getUser = async () => {
  const context = await getPaymentsCitizenContext();
  return context;
};
