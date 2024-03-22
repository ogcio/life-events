import { getPaymentRequestDetails } from "../../db";
import { PgSessions } from "auth/sessions";
import { pgpool } from "../../../../../dbConnection";
import { redirect } from "next/navigation";
import PaymentSetupForm from "../../PaymentSetupForm";
import { stringToAmount } from "../../../../../utils";

const updateProvider = async (
  client,
  paymentRequestId,
  currentProvider,
  newProviderId,
) => {
  // If I deleted the provider, disable it
  if (currentProvider && !newProviderId) {
    await client.query(
      `update payment_requests_providers set enabled = false where payment_request_id = $1 and provider_id = $2`,
      [paymentRequestId, currentProvider.provider_id],
    );
  }

  //If I selected a provider (manual, stripe, openbanking) and before there was nothing, create it
  if (newProviderId && !currentProvider) {
    await client.query(
      `
          INSERT INTO payment_requests_providers (provider_id, payment_request_id, enabled) 
          VALUES ($1, $2, true)
          ON CONFLICT (provider_id, payment_request_id) 
          DO UPDATE SET enabled = EXCLUDED.enabled`,
      [newProviderId, paymentRequestId],
    );
  }

  // If I changed the provider, update it
  if (
    currentProvider &&
    newProviderId &&
    currentProvider.provider_id !== newProviderId
  ) {
    await client.query(
      `update payment_requests_providers set enabled = false where payment_request_id = $1 and provider_id = $2`,
      [paymentRequestId, currentProvider.provider_id],
    );
    await client.query(
      `
          INSERT INTO payment_requests_providers (provider_id, payment_request_id, enabled) 
          VALUES ($1, $2, true)
          ON CONFLICT (provider_id, payment_request_id) 
          DO UPDATE SET enabled = EXCLUDED.enabled`,
      [newProviderId, paymentRequestId],
    );
  }
};

async function editPayment(
  userId: string,
  paymentRequestId: string,
  formData: FormData,
) {
  "use server";

  const amount = stringToAmount(formData.get("amount")?.toString() as string);

  const data = {
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
    reference: formData.get("reference")?.toString(),
    amount,
    redirectUrl: formData.get("redirect-url")?.toString(),
    allowAmountOverride: formData.get("allowAmountOverride") === "on",
    allowCustomAmount: formData.get("allowCustomAmount") === "on",
  };

  const client = await pgpool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `update payment_requests 
    set title = $1, description = $2, reference = $3, amount = $4, redirect_url = $5, allow_amount_override = $6, allow_custom_amount = $7 
    where payment_request_id = $8 and user_id = $9`,
      [
        data.title,
        data.description,
        data.reference,
        data.amount,
        data.redirectUrl,
        data.allowAmountOverride,
        data.allowCustomAmount,
        paymentRequestId,
        userId,
      ],
    );

    const details = await getPaymentRequestDetails(paymentRequestId);
    if (!details) throw new Error("Payment request not found");

    const { providers } = details;

    await updateProvider(
      client,
      paymentRequestId,
      providers.find(
        (provider) =>
          provider.provider_type === "openbanking" && provider.enabled,
      ),
      formData.get("openbanking-account")?.toString(),
    );

    await updateProvider(
      client,
      paymentRequestId,
      providers.find(
        (provider) =>
          provider.provider_type === "banktransfer" && provider.enabled,
      ),
      formData.get("banktransfer-account")?.toString(),
    );

    await updateProvider(
      client,
      paymentRequestId,
      providers.find(
        (provider) => provider.provider_type === "stripe" && provider.enabled,
      ),
      formData.get("stripe-account")?.toString(),
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

  console.log(JSON.stringify(details, null, 2));

  return (
    <PaymentSetupForm
      userId={userId}
      action={submitPayment}
      details={details}
    />
  );
}
