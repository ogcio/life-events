import { AuthSession } from "auth/auth-session";
import {
  baseConfig,
  citizenScopes,
  commonScopes,
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
