import Link from "next/link";
import { Payments } from "building-blocks-sdk";
import { getAuthenticationContext } from "./config";

const actionCitizen = async () => {
  "use server";

  const context = await getAuthenticationContext();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  new Payments(token).testCitizenAuth();
};

const actionPublicServant = async () => {
  "use server";

  const context = await getAuthenticationContext();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  new Payments(token).testPublicServantAuth();
};

export default async function () {
  const context = await getAuthenticationContext();

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

      {context && <Link href="/logto_integration/signout">Logout</Link>}
    </>
  );
}
