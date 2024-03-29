import { getUserInfoById } from "auth/sessions";
import { pgpool } from "../../../dbConnection";
import { PaymentRequestDO } from "../../../../types/common";

export type PaymentRequestDetails = Pick<
  PaymentRequestDO,
  | "payment_request_id"
  | "title"
  | "description"
  | "amount"
  | "reference"
  | "redirect_url"
  | "allowAmountOverride"
  | "allowCustomAmount"
> & {
  providers: {
    provider_name: string;
    provider_type: string;
    provider_id: string;
  }[];
};

export async function getPaymentRequestDetails(
  requestId: string,
): Promise<PaymentRequestDetails | undefined> {
  "use server";
  const res = await pgpool.query<PaymentRequestDetails>(
    `SELECT pr.title,
        pr.payment_request_id,
        pr.description,
        pr.amount,
        json_agg(pp) as providers,
        pr.reference,
        pr.redirect_url,
        pr.allow_amount_override AS "allowAmountOverride",
        pr.allow_custom_amount AS "allowCustomAmount"
    FROM payment_requests pr
    JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
    JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
    WHERE pr.payment_request_id = $1
    GROUP BY pr.payment_request_id
`,
    [requestId],
  );

  if (!res.rowCount) {
    return undefined;
  }

  return res.rows[0];
}

export async function getUserPaymentRequestDetails(
  userId: string,
): Promise<PaymentRequestDetails[]> {
  "use server";

  const res = await pgpool.query<PaymentRequestDetails>(
    `select pr.title, pr.payment_request_id, pr.description, pr.amount, pr.reference, json_agg(pp) as providers
      from payment_requests pr
      join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id
      join payment_providers pp on ppr.provider_id = pp.provider_id
      where pr.user_id = $1
      group by pr.payment_request_id`,
    [userId],
  );

  if (!res.rowCount) {
    return [];
  }

  return res.rows;
}

type TransactionDetails = {
  status: string;
  citizen_name: string;
  title: string;
  amount: number;
  updated_at: string;
  transaction_id: string;
};
export async function getUserTransactionDetails(userId: string) {
  const userInfo = await getUserInfoById(userId);
  if (!userInfo) return [];

  const res = await pgpool.query(
    `
  SELECT
    t.transaction_id,
    t.status,
    pr.title,
    t.amount,
    t.updated_at
  FROM payment_transactions t
  LEFT JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
  ORDER BY t.updated_at DESC
`,
    [],
  );
  const transactions = res.rows;

  for (let transaction of transactions) {
    transaction.citizen_name = userInfo.user_name;
  }

  return transactions;
}

export async function getRequestTransactionDetails(requestId: string) {
  "use server";

  const res = await pgpool.query<TransactionDetails>(
    `SELECT
      t.transaction_id,
      t.status,
      pr.title,
      pt.amount,
      t.updated_at
    FROM payment_transactions t
    INNER JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
    INNER JOIN payment_transactions pt ON pt.transaction_id = t.transaction_id
    WHERE pr.payment_request_id = $1
    ORDER BY t.updated_at DESC`,
    [requestId],
  );

  return res.rows;
}

export async function createTransaction(
  paymentId: string,
  extPaymentId: string,
  tenantReference: string,
  amount: number,
  paymentProviderId: string,
  userInfo: {
    name: string;
    email: string;
  },
) {
  "use server";
  return (
    await pgpool.query<{ transaction_id: number }>(
      `
    insert into payment_transactions (payment_request_id, ext_payment_id, integration_reference, amount, status, created_at, updated_at, payment_provider_id, user_data)
    values ($1, $2, $3, $4, 'initiated', now(), now(), $5, $6) returning transaction_id;
    `,
      [
        paymentId,
        extPaymentId,
        tenantReference,
        amount,
        paymentProviderId,
        userInfo,
      ],
    )
  ).rows[0].transaction_id;
}
