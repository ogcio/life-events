import { getTranslations } from "next-intl/server";
import { pgpool } from "../../../../dbConnection";
import { RedirectType, redirect } from "next/navigation";

type Props = {
  searchParams:
    | {
        error: string | undefined;
        payment_id: string;
        returnUrl: string
      }
    | undefined;
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
    [status, extPaymentId]
  );

  if (!rows.length) {
    console.error("Transaction not found", extPaymentId);
    throw new Error("Transaction not found");
  }

  return rows[0];
}

async function getRequestDetails(requestId: string) {
  "use server";

  const res = await pgpool.query<{ amount: number, redirect_url: string }>(
    `
    select
      redirect_url,
      amount
    from payment_requests
    where payment_request_id = $1
    `,
    [requestId]
  );

  return res.rows[0];
}

export default async function Page(props: Props) {
  const t = await getTranslations("Common")
  if (!props.searchParams?.payment_id) {
    return <h1>{t('notFound')}</h1>;
  }

  let status = "executed";

  if (props.searchParams?.error) {
    status = props.searchParams.error === "tl_hpp_abandoned" ? "abandoned" : "error";
  }

  const transactionDetail = await updateTransaction(props.searchParams.payment_id, status)
  const requestDetail = await getRequestDetails(transactionDetail.payment_request_id);

  const returnUrl = new URL(requestDetail.redirect_url);
  returnUrl.searchParams.append("transactionId", transactionDetail.transaction_id.toString());
  returnUrl.searchParams.append("id", transactionDetail.integration_reference);
  returnUrl.searchParams.append("status", status);
  returnUrl.searchParams.append("pay", requestDetail.amount.toString());

  redirect(returnUrl.href, RedirectType.replace);
}
