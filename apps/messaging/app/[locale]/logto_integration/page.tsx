import Link from "next/link";
import { Messaging, Payments } from "building-blocks-sdk";
import { getCitizenContext, getPublicServantContext } from "./config";

const actionCitizen = async () => {
  "use server";

  const context = await getCitizenContext();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");
  new Messaging(token).testCitizenAuth();
};

const actionOrganization = async () => {
  "use server";
  const organisation = await getPublicServantContext();
  if (!organisation.accessToken) return console.log("missing token...");
  new Messaging(organisation.accessToken).testPublicServantAuth();
};

export default async function () {
  const context = await getCitizenContext();
  const organizations = await getPublicServantContext();

  return (
    <>
      <h1>CITIZEN PAYLOAD</h1>
      <pre>{JSON.stringify(context, null, 2)}</pre>
      <form action={actionCitizen}>
        <button>API CALL - Citizen</button>
      </form>

      <h1>ORGANIZATION PAYLOAD</h1>
      <pre>{JSON.stringify(organizations, null, 2)}</pre>
      <form action={actionOrganization}>
        <button>API CALL - Organization</button>
      </form>

      {context && <Link href="/logto_integration/signout">Logout</Link>}
    </>
  );
}
