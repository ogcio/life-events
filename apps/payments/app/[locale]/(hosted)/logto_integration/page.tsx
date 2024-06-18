import Link from "next/link";
import { Payments } from "building-blocks-sdk";
import { getPaymentsCitizenContext } from "./config";
import { revalidatePath } from "next/cache";

const actionCitizen = async () => {
  "use server";

  const context = await getPaymentsCitizenContext();

  const token = context.accessToken;
  if (!token) return console.log("missing token...");
  new Payments(token).testCitizenAuth();
};

export default async function () {
  const context = await getPaymentsCitizenContext();

  return (
    <>
      <h1>CITIZEN PAYLOAD</h1>
      <pre>{JSON.stringify(context, null, 2)}</pre>
      <form action={actionCitizen}>
        <button>API CALL - Citizen</button>
      </form>

      {context && context.isAuthenticated && (
        <Link href="/logto_integration/signout">Logout</Link>
      )}
    </>
  );
}
