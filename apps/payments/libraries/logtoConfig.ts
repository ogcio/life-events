import { UserScope } from "@logto/next";

export const logtoConfig = {
  appId: process.env.LOGTO_APP_ID as string,
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.LOGTO_BASE_URL as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  appSecret: process.env.LOGTO_APP_SECRET as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,
  resources: ["http://localhost:8001/"],
  scopes: [
    "payments:read",
    UserScope.Email,
    UserScope.Phone,
    UserScope.CustomData,
    UserScope.Identities,
    UserScope.Organizations,
  ],
};
