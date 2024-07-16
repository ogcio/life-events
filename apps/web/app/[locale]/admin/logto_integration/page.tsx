import Link from "next/link";
import { Messaging } from "building-blocks-sdk";
import { getAuthenticationContext } from "./config";
import { hasPermissions } from "auth/check-permissions";

export default async function () {
  const context = await getAuthenticationContext();

  const hasPermission = hasPermissions(
    context.accessToken as string,
    context.scopes,
    ["life-events:digital-wallet-flow:*"],
  );

  console.log("check permission", hasPermission);

  return (
    <>
      <h1>CONTEXT PAYLOAD</h1>
      <pre>{JSON.stringify(context, null, 2)}</pre>

      {!hasPermission && <h3>THIS USER HAS GOT NO ADMIN PERMISSION</h3>}

      {context && <Link href="/logto_integration/signout">Logout</Link>}
    </>
  );
}
