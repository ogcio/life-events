import { AuthSessionContext, AuthUserScope } from "auth/index";
import { AuthSession } from "auth/auth-session";

export const paymentsApiResource = process.env.PAYMENTS_BACKEND_URL + "/";

const orgScopes = [
  AuthUserScope.Organizations,
  AuthUserScope.OrganizationRoles,
];

const publicServantExpectedRole = "Public Servant";
const organizationId = "ogcio";

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_PAYMENTS_APP_ID as string,
  appSecret: process.env.LOGTO_PAYMENTS_APP_SECRET as string,
};

// All the permissions of a normal citizen
export const citizenScopes = [
  "payments:provider.public:read",
  "payments:payment_request.public:read",
  "payments:transaction.self:write",
  "payments:transaction.self:read",
];
export const paymentsPublicServantScopes = [
  "payments:payment_request:*",
  "payments:transaction:*",
  "payments:provider:*",
  "payments:payment_request.public:read",
];

export default {
  ...baseConfig,
  // All the available resources to the app
  resources: [paymentsApiResource],
  scopes: [...orgScopes, ...citizenScopes, ...paymentsPublicServantScopes],
};

export const getAuthenticationContext =
  async (): Promise<AuthSessionContext> => {
    const citizenContext = await getPaymentsCitizenContext();
    if (citizenContext.isPublicServant) {
      return getPaymentsOrganizationContext();
    }

    return citizenContext;
  };

const getPaymentsCitizenContext = () =>
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

const getPaymentsOrganizationContext = () =>
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

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT;
