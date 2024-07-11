import Link from "next/link";
import { Messaging } from "building-blocks-sdk";
import { getAuthenticationContext } from "./config";
import { hasPermissions } from "auth/check-permissions";

const actionCitizen = async () => {
  "use server";

  const context = await getAuthenticationContext();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  new Messaging(token).testCitizenAuth();
};

const actionPublicServant = async () => {
  "use server";

  const context = await getAuthenticationContext();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  new Messaging(token).testPublicServantAuth();
};

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
      <form action={actionCitizen}>
        <button>API CALL - Citizen</button>
      </form>
      <form action={actionPublicServant}>
        <button>API CALL - Public Servant</button>
      </form>

      {!hasPermission && <h3>THIS USER HAS GOT NO ADMIN PERMISSION</h3>}

      {context && <Link href="/logto_integration/signout">Logout</Link>}
    </>
  );
}
