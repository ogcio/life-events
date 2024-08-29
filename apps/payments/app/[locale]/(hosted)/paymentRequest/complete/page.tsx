import { pgpool } from "../../../../dbConnection";
import { RedirectType, notFound, redirect } from "next/navigation";
import { TransactionStatuses } from "../../../../../types/TransactionStatuses";
import { errorHandler, getInternalStatus } from "../../../../utils";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { getTrueLayerPaymentDetails } from "../../../../integration/trueLayer";

type Props = {
  searchParams: {
    error?: string | undefined;
    payment_id?: string;
    payment_intent?: string;
    order_id?: string;
    redirect_status?: string;
  };
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
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: details, error } =
    await paymentsApi.getPaymentRequestPublicInfo(requestId);

  if (error) {
    errorHandler(error);
  }

  return details;
}

export default async function Page(props: Props) {
  const { payment_id, payment_intent, redirect_status, order_id, error } =
    props.searchParams;
  let extPaymentId = payment_id ?? "";

  let status = TransactionStatuses.Succeeded;

  if (payment_id) {
    // It's a TrueLayer transaction
    const paymentDetails = await getTrueLayerPaymentDetails(payment_id);
    status = getInternalStatus(paymentDetails.status);
  }

  if (!extPaymentId) {
    if (order_id) {
      // It's a Realex transaction
      extPaymentId = order_id;
      status = TransactionStatuses.Succeeded;
    } else if (payment_intent && redirect_status) {
      // It's a Stripe transaction
      extPaymentId = payment_intent;

      const mappedStatus = getInternalStatus(redirect_status);
      if (!mappedStatus) {
        throw new Error("Invalid payment intent status received!");
      }

      status = mappedStatus;
    } else {
      return notFound();
    }
  }

  if (error) {
    status = TransactionStatuses.Failed;
  }

  const transactionDetail = await updateTransaction(extPaymentId, status);

  if (status === TransactionStatuses.Failed) {
    return (
      <h3 style={{ textAlign: "center", marginTop: "5rem" }}>
        There was an error processing your payment.
      </h3>
    );
  }

  const requestDetail = await getRequestDetails(
    transactionDetail.payment_request_id,
  );

  if (!requestDetail) {
    return notFound();
  }

  let url = requestDetail.redirectUrl.includes("://")
    ? requestDetail.redirectUrl
    : `http://${requestDetail.redirectUrl}`;

  const returnUrl = new URL(url);
  returnUrl.searchParams.append(
    "transactionId",
    transactionDetail.transaction_id.toString(),
  );
  returnUrl.searchParams.append("id", transactionDetail.integration_reference);
  returnUrl.searchParams.append("status", status);
  returnUrl.searchParams.append("pay", requestDetail.amount.toString());

  redirect(returnUrl.href, RedirectType.replace);
}
