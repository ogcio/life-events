import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";
import PaymentSetupForm from "../PaymentSetupForm";
import { stringToAmount } from "../../../../utils";
import buildApiClient from "../../../../../client/index";

type Account = {
  account: string;
  enabled: boolean;
};

async function createPayment(userId: string, formData: FormData) {
  "use server";

  const accounts: Account[] = [
    {
      account: formData.get("openbanking-account")?.toString(),
      enabled: true,
    },
    {
      account: formData.get("banktransfer-account")?.toString(),
      enabled: true,
    },
    {
      account: formData.get("stripe-account")?.toString(),
      enabled: true,
    },
    {
      account: formData.get("worldpay-account")?.toString(),
      enabled: false,
    },
  ].filter((acc): acc is Account => !!acc.account);

  if (!accounts.length) {
    throw new Error("Failed to create payment");
  }

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    reference: formData.get("reference") as string,
    amount: stringToAmount(formData.get("amount")?.toString() as string),
    redirectUrl: formData.get("redirect-url") as string,
    allowAmountOverride: formData.get("allowAmountOverride") === "on",
    allowCustomAmount: formData.get("allowCustomAmount") === "on",
    accounts,
  };

  const paymentRequestId = (
    await buildApiClient(userId).paymentRequests.apiV1RequestsPost(data)
  ).data.id;

  redirect(`./requests/${paymentRequestId}`, RedirectType.replace);
}

export default async function Page() {
  const { userId } = await PgSessions.get();
  const submitPayment = createPayment.bind(this, userId);

  return <PaymentSetupForm userId={userId} action={submitPayment} />;
}
