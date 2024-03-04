import { RedirectType, redirect } from "next/navigation";
import { routeDefinitions } from "../../../../routeDefinitions";
import { PgSessions } from "auth/sessions";
import { pgpool } from "../../../../dbConnection";
import { createPaymentRequest } from "../../../../integration/trueLayer";
import OpenBankingHost from "../OpenBankingHost";

async function getPaymentDetails(paymentId: string) {
  "use server";
  const { rows } = await pgpool.query(
    `
    select
      pr.payment_request_id,
      pr.user_id,
      pr.title,
      pr.description,
      pr.reference,
      pr.amount,
      pp.provider_id,
      pp.provider_name,
      pp.provider_data,
      u.govid_email,
      u.user_name
    from payment_requests pr
    join payment_providers pp on pr.provider_id = pp.provider_id
    join users u on pr.user_id = u.id
    where pr.payment_request_id = $1
      and pp.provider_type = 'openbanking'
    `,
    [paymentId]
  );

  if (!rows.length) {
    return undefined;
  }

  return createPaymentRequest(rows[0]);
}

async function createTransaction(paymentId: string, userId: string, tlPaymentId: string) {
  "use server";
  const res = await pgpool.query<{ transaction_id: number }>(
    `
    insert into payment_transactions (payment_request_id, user_id, tl_payment_id, status, created_at, updated_at)
    values ($1, $2, $3, 'pending', now(), now())
    returning transaction_id
    `,
    [paymentId, userId, tlPaymentId]
  );
  return res.rows[0].transaction_id;
}

export default async function Bank(params: {
  searchParams: { paymentId: string } | undefined;
}) {
  if (!params.searchParams?.paymentId) {
    redirect(routeDefinitions.paymentRequest.pay.path(), RedirectType.replace);
  }

  const { userId } = await PgSessions.get();

  const paymentDetails = await getPaymentDetails(
    params.searchParams.paymentId,
  );

  const transactionId = await createTransaction(params.searchParams.paymentId, userId, paymentDetails.id)

  const returnUri = new URL("/en/paymentRequest/complete", process.env.HOST_URL);
  const errorUri = new URL("/en/paymentRequest/error", process.env.HOST_URL);
  errorUri.searchParams.append("transactionId", transactionId.toString());
  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
        alignItems: "center",
      }}
    >
      <OpenBankingHost
        resourceToken={paymentDetails.resource_token}
        paymentId={paymentDetails.id}
        returnUri={returnUri.toString()}
        errorUri={errorUri.toString()}
      />
    </div>
  );
}
