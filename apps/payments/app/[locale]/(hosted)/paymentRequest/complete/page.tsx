import { getTranslations } from "next-intl/server";
import { pgpool } from "../../../../dbConnection";
import { RedirectType, redirect } from "next/navigation";
import { getPaymentIntent } from "../../../../integration/stripe";
import { ProviderType } from "../../paymentSetup/providers/types";

type Props = {
  searchParams:
    | {
        error?: string | undefined;
        payment_id?: string;
        payment_intent?: string;
      }
    | undefined;
};

const paymentStatus = {
  canceled: "canceled",
  pending: "pending",
  succeeded: "succeeded",
  failed: "failed",
};

const getInternalStatus = (provider: ProviderType, status: string) => {
  const map = {
    stripe: {
      canceled: paymentStatus.canceled,
      processing: paymentStatus.pending,
      succeeded: paymentStatus.succeeded,
    },
    openbanking: {
      authorization_required: paymentStatus.pending,
      authorizing: paymentStatus.pending,
      authorized: paymentStatus.pending,
      executed: paymentStatus.pending,
      failed: paymentStatus.canceled,
      settled: paymentStatus.succeeded,
    },
    banktransfer: {},
    worldpay: {},
  };

  return map[provider]?.[status];
};

async function updateTransaction(extPaymentId: string, status: string) {
  "use server";

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
  "use server";

  const res = await pgpool.query<{ amount: number; redirect_url: string }>(
    `
    select
      redirect_url,
      amount
    from payment_requests
    where payment_request_id = $1
    `,
    [requestId],
  );

  return res.rows[0];
}

export default async function Page(props: Props) {
  const t = await getTranslations("Common");

  let extPaymentId = props.searchParams?.payment_id ?? "";
  let status = "pending";

  if (props.searchParams?.error) {
    status =
      props.searchParams.error === "tl_hpp_abandoned" ? "abandoned" : "error";
  }

  if (!extPaymentId) {
    if (props.searchParams?.payment_intent) {
      const paymentIntent = await getPaymentIntent(
        props.searchParams!.payment_intent,
      );
      extPaymentId = paymentIntent.id;

      status = paymentIntent.status;
    } else {
      return <h1 className="govie-heading-l">{t("notFound")}</h1>;
    }
  }

  const transactionDetail = await updateTransaction(extPaymentId, status);
  const requestDetail = await getRequestDetails(
    transactionDetail.payment_request_id,
  );

  const returnUrl = new URL(requestDetail.redirect_url);
  returnUrl.searchParams.append(
    "transactionId",
    transactionDetail.transaction_id.toString(),
  );
  returnUrl.searchParams.append("id", transactionDetail.integration_reference);
  returnUrl.searchParams.append("status", status);
  returnUrl.searchParams.append("pay", requestDetail.amount.toString());

  redirect(returnUrl.href, RedirectType.replace);
}
