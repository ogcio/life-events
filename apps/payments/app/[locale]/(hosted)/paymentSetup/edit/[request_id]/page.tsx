import { getTranslations } from "next-intl/server";
import { getPaymentRequestDetails } from "../../db";
import { PgSessions } from "auth/sessions";
import { pgpool } from "../../../../../dbConnection";
import { redirect } from "next/navigation";
import PaymentSetupForm from "../../PaymentSetupForm";

async function editPayment(
  userId: string,
  paymentRequestId: string,
  formData: FormData,
) {
  "use server";

  const amountAsString = formData.get("amount")?.toString() ?? "";
  // JS sucks at handling money
  const amount = Math.round(parseFloat(amountAsString) * 100);

  const data = {
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
    reference: formData.get("reference")?.toString(),
    amount,
    redirectUrl: formData.get("redirect-url")?.toString(),
    allowAmountOverride: formData.get("allowAmountOverride") === "on",
  };

  const client = await pgpool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `update payment_requests 
    set title = $1, description = $2, reference = $3, amount = $4, redirect_url = $5, allow_amount_override = $6 
    where payment_request_id = $7`,
      [
        data.title,
        data.description,
        data.reference,
        data.amount,
        data.redirectUrl,
        data.allowAmountOverride,
        paymentRequestId,
      ],
    );
    await client.query("COMMIT");

    //TODO: Add the possibility to update providers in the edit
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
  redirect(`/paymentSetup/requests/${paymentRequestId}`);
}

export default async function (props: { params: { request_id: string } }) {
  const details = await getPaymentRequestDetails(props.params.request_id);
  const { userId } = await PgSessions.get();

  if (!details) {
    return <h1 className="govie-heading-l">Payment request not found</h1>;
  }

  const submitPayment = editPayment.bind(
    this,
    userId,
    details.payment_request_id,
  );

  return (
    <PaymentSetupForm
      userId={userId}
      action={submitPayment}
      details={details}
    />
  );
}
