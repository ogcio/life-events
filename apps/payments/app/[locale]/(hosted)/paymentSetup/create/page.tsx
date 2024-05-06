import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";
import PaymentSetupForm from "../PaymentSetupForm";
import { stringToAmount } from "../../../../utils";
import { Payments } from "building-blocks-sdk";
import { PaymentRequestStatus } from "../../../../../types/common";

async function createPayment(userId: string, formData: FormData) {
  "use server";

  const providers: string[] = [
    formData.get("openbanking-account")?.toString(),
    formData.get("banktransfer-account")?.toString(),
    formData.get("card-account")?.toString(),
  ].filter((provider): provider is string => !!provider);

  const paymentRequestId = (
    await new Payments(userId).createPaymentRequest({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      reference: formData.get("reference") as string,
      amount: stringToAmount(formData.get("amount")?.toString() as string),
      redirectUrl: formData.get("redirect-url") as string,
      allowAmountOverride: formData.get("allowAmountOverride") === "on",
      allowCustomAmount: formData.get("allowCustomAmount") === "on",
      status: formData.get("status") as PaymentRequestStatus,
      providers,
    })
  ).data?.id;

  redirect(`./requests/${paymentRequestId}`, RedirectType.replace);
}

export default async function Page() {
  const { userId } = await PgSessions.get();
  const submitPayment = createPayment.bind(this, userId);

  return <PaymentSetupForm userId={userId} action={submitPayment} />;
}
