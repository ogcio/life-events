import Link from "next/link";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";

const actionCitizen = async () => {
  "use server";

  const context = await AuthenticationFactory.getInstance().getCitizen();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  const paymentClient = await AuthenticationFactory.getPaymentsClient({
    token,
  });
  paymentClient.testCitizenAuth();
};

const actionPublicServant = async () => {
  "use server";

  const context = await AuthenticationFactory.getInstance().getPublicServant();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");

  const paymentClient = await AuthenticationFactory.getPaymentsClient({
    token,
  });
  paymentClient.testPublicServantAuth();
};

export default async function () {
  const context = await AuthenticationFactory.getInstance().getContext();

  return (
    <>
      <h1>CITIZEN CONTEXT PAYLOAD</h1>
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
