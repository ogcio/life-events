import { UserScope } from "@logto/next";

export const logtoConfig = {
  appId: process.env.LOGTO_APP_ID as string,
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.LOGTO_BASE_URL as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  appSecret: process.env.LOGTO_APP_SECRET as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,
  // All the availabie resources to the app
  resources: [process.env.PAYMENTS_BACKEND_URL + "/"],
  scopes: [UserScope.Organizations, UserScope.OrganizationRoles],
};
