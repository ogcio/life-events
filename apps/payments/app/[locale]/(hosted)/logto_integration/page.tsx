import { getLogtoContext } from "@logto/next/server-actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import logtoConfig from "./config";

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
