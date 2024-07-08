import Link from "next/link";
import { Payments } from "building-blocks-sdk";
import {
  getPaymentsCitizenContext,
  getPaymentsPublicServantContext,
} from "../../../../libraries/auth";

const actionCitizen = async () => {
  "use server";

  const context = await getPaymentsCitizenContext();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  new Payments(token).testCitizenAuth();
};

const actionPublicServant = async () => {
  "use server";

  const context = await getPaymentsPublicServantContext();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  new Payments(token).testPublicServantAuth();
};

export default async function () {
  const context = await getPaymentsCitizenContext();

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

      {context && <Link href="/signout">Logout</Link>}
    </>
  );
}
