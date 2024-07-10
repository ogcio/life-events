import Link from "next/link";
import { Messaging } from "building-blocks-sdk";
import { AuthenticationContextFactory } from "auth/authentication-context-factory";

const actionCitizen = async () => {
  "use server";

  const context = await AuthenticationContextFactory.getCitizen();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  new Messaging(token).testCitizenAuth();
};

const actionPublicServant = async () => {
  "use server";

  const context = await AuthenticationContextFactory.getPublicServant();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  new Messaging(token).testPublicServantAuth();
};

export default async function () {
  const context = await AuthenticationContextFactory.getContext();

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
