import { UserScope } from "@logto/next";
import { getLogtoContext } from "@logto/next/server-actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export const logtoConfig = {
  cookieSecure: process.env.NODE_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT as string,
  endpoint: process.env.LOGTO_ENDPOINT as string,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET as string,

  appId: process.env.LOGTO_PAYMENTS_APP_ID as string,
  appSecret: process.env.LOGTO_PAYMENTS_APP_SECRET as string,

  scopes: [UserScope.Organizations, UserScope.OrganizationRoles],
};

export const postSignoutRedirect =
  process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT;

export default async function () {
  const context = await getLogtoContext(logtoConfig, {
    fetchUserInfo: true,
    getAccessToken: true,
    getOrganizationToken: true,
  });

  if (!context.isAuthenticated) {
    redirect("./logto_integration/login");
  }

  return (
    <>
      <pre>{JSON.stringify(context, null, 2)}</pre>
      {context && context.isAuthenticated && (
        <Link href="/logto_integration/signout">Logout</Link>
      )}
    </>
  );
}
