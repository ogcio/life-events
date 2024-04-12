import { getTranslations } from "next-intl/server";
import { pgpool } from "../../../../dbConnection";
import { RedirectType, notFound, redirect } from "next/navigation";
import {
  getInternalStatus,
  getPaymentIntent,
} from "../../../../integration/stripe";
import buildApiClient from "../../../../../client/index";
import { PgSessions } from "auth/sessions";
import { TransactionStatuses } from "../../../../../types/TransactionStatuses";

type Props = {
  searchParams:
    | {
        error?: string | undefined;
        payment_id?: string;
        payment_intent?: string;
      }
    | undefined;
};

async function updateTransaction(extPaymentId: string, status: string) {
  "use server";

  // TODO: Do not touch this for now!
  const { rows } = await pgpool.query<{
    transaction_id: number;
    payment_request_id: string;
    integration_reference: string;
  }>(
    `
    update payment_transactions
    set status = $1, updated_at = now()
    where ext_payment_id = $2
    returning transaction_id, payment_request_id, integration_reference
    `,
    [status, extPaymentId],
  );

  if (!rows.length) {
    console.error("Transaction not found", extPaymentId);
    throw new Error("Transaction not found");
  }

  return rows[0];
}

async function getRequestDetails(requestId: string) {
  const { userId } = await PgSessions.get();
  const details = (
    await buildApiClient(userId).paymentRequests.apiV1RequestsRequestIdGet(
      requestId,
    )
  ).data;

  return details;
}

export default async function Page(props: Props) {
  const t = await getTranslations("Common");

  let extPaymentId = props.searchParams?.payment_id ?? "";
  let status = TransactionStatuses.Succeeded;

  if (props.searchParams?.error) {
    status = TransactionStatuses.Failed;
  }

  if (!extPaymentId) {
    if (props.searchParams?.payment_intent) {
      const paymentIntent = await getPaymentIntent(
        props.searchParams!.payment_intent,
      );
      extPaymentId = paymentIntent.id;

      const mappedStatus = getInternalStatus(paymentIntent.status);

      if (!mappedStatus) {
        throw new Error("Invalid payment intent status recieved!");
      }

      status = mappedStatus;
    } else {
      notFound();
    }
  }

  const transactionDetail = await updateTransaction(extPaymentId, status);
  const requestDetail = await getRequestDetails(
    transactionDetail.payment_request_id,
  );

  const returnUrl = new URL(requestDetail.redirectUrl);
  returnUrl.searchParams.append(
    "transactionId",
    transactionDetail.transaction_id.toString(),
  );
  returnUrl.searchParams.append("id", transactionDetail.integration_reference);
  returnUrl.searchParams.append("status", status);
  returnUrl.searchParams.append("pay", requestDetail.amount.toString());

  redirect(returnUrl.href, RedirectType.replace);
}
