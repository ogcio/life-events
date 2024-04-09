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

export async function getUserTransactionDetails(userId: string) {
  const userInfo = await getUserInfoById(userId);
  if (!userInfo) return [];

  // TODO: Do not touch this for now!
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

  return transactions;
}
