import { getUserInfoById } from "auth/sessions";
import { pgpool } from "../../../dbConnection";
import { PaymentRequestDO } from "../../../../types/common";

export type PaymentRequestDetails = Pick<
  PaymentRequestDO,
  | "paymentRequestId"
  | "title"
  | "description"
  | "amount"
  | "reference"
  | "redirectUrl"
  | "allowAmountOverride"
  | "allowCustomAmount"
> & {
  providers: {
    name: string;
    type: string;
    id: string;
  }[];
};

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
    values ($1, $2, $3, $4, 'pending', now(), now(), $5, $6) returning transaction_id;
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
