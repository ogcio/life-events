import Link from "next/link";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { headers } from "next/headers";

const getToken = async () => {
  const cookieHeader = headers().get("cookie") as unknown as string;
  const res = await fetch(`${process.env.NEXT_PUBLIC_HOST_URL}/api/token`, {
    headers: { cookie: cookieHeader },
  });
  return await res.json();
};

const actionCitizen = async () => {
  "use server";

  const paymentClient = await AuthenticationFactory.getPaymentsClient();
  paymentClient.testCitizenAuth();
};

const actionPublicServant = async () => {
  "use server";

  const paymentClient = await AuthenticationFactory.getPaymentsClient();
  paymentClient.testPublicServantAuth();
};

export default async function () {
  const context = await AuthenticationFactory.getInstance().getContext();

  const { token } = await getToken();

  return (
    <>
      <h1>CONTEXT PAYLOAD</h1>
      <pre>{JSON.stringify(context, null, 2)}</pre>
      <h3>TOKEN</h3>
      <pre>{token}</pre>
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
