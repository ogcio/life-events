import { PgSessions } from "auth/sessions";
import { pgpool } from "../../../../../dbConnection";
import { redirect } from "next/navigation";
import PaymentSetupForm from "../../PaymentSetupForm";
import { stringToAmount } from "../../../../../utils";
import buildApiClient from "../../../../../../client/index";

const updateProvider = async (
  client,
  paymentRequestId,
  currentProviderId,
  newProviderId,
) => {
  // If I deleted the provider, disable it
  if (currentProviderId && !newProviderId) {
    await client.query(
      `update payment_requests_providers set enabled = false where payment_request_id = $1 and provider_id = $2`,
      [paymentRequestId, currentProviderId],
    );
  }

  //If I selected a provider (manual, stripe, openbanking) and before there was nothing, create it
  if (newProviderId && !currentProviderId) {
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
    currentProviderId &&
    newProviderId &&
    currentProviderId !== newProviderId
  ) {
    await client.query(
      `update payment_requests_providers set enabled = false where payment_request_id = $1 and provider_id = $2`,
      [paymentRequestId, currentProviderId],
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

    const details = (
      await buildApiClient(userId).paymentRequests.apiV1RequestsRequestIdGet(
        paymentRequestId,
      )
    ).data;

    if (!details) throw new Error("Payment request not found");

    const { providers } = details;

    await Promise.all([
      updateProvider(
        client,
        paymentRequestId,
        providers.find((provider) => provider.type === "openbanking")?.id,
        formData.get("openbanking-account")?.toString(),
      ),
      updateProvider(
        client,
        paymentRequestId,
        providers.find((provider) => provider.type === "banktransfer")?.id,
        formData.get("banktransfer-account")?.toString(),
      ),
      updateProvider(
        client,
        paymentRequestId,
        providers.find((provider) => provider.type === "stripe")?.id,
        formData.get("stripe-account")?.toString(),
      ),
    ]);

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  redirect(`/paymentSetup/requests/${paymentRequestId}`);
}

export default async function (props: { params: { request_id: string } }) {
  const { userId } = await PgSessions.get();
  const details = (
    await buildApiClient(userId).paymentRequests.apiV1RequestsRequestIdGet(
      props.params.request_id,
    )
  ).data;

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
