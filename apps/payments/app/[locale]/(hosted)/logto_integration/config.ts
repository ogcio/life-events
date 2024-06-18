import { AuthUserScope } from "auth/index";
import { AuthSession } from "auth/auth-session";

export const paymentsApiResource = process.env.PAYMENTS_BACKEND_URL + "/";

const orgScopes = [
  AuthUserScope.Organizations,
  AuthUserScope.OrganizationRoles,
];

export const baseConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_PAYMENTS_APP_ID as string,
  appSecret: process.env.LOGTO_PAYMENTS_APP_SECRET as string,
};

// All the permissions of a normal citizen
const citizenScopes = ["payments:create:payment"];

export default {
  ...baseConfig,
  // All the availabie resources to the app
  resources: [paymentsApiResource],
  scopes: [...citizenScopes],
};

export const getPaymentsCitizenContext = () =>
  AuthSession.get(
    {
      ...baseConfig,
      resources: [paymentsApiResource],
      scopes: [...citizenScopes],
    },
    {
      getAccessToken: true,
      resource: paymentsApiResource,
    },
  );

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT;
