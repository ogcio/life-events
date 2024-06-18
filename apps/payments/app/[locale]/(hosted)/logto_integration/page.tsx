import Link from "next/link";
import logtoConfig from "./config";
import { AuthSession } from "auth/auth-session";

export default async function () {
  const context = await AuthSession.get(logtoConfig, {
    fetchUserInfo: true,
    getAccessToken: true,
    getOrganizationToken: true,
  });

  return (
    <>
      <pre>{JSON.stringify(context, null, 2)}</pre>
      {context && context.isAuthenticated && (
        <Link href="/logto_integration/signout">Logout</Link>
      )}
    </>
  );
}
