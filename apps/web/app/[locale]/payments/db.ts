import { pgpool } from "../../dbConnection";

type PaymentRequestDO = {
  payment_request_id: string;
  user_id: string;
  title: string;
  description: string;
  provider_id: string;
  reference: string;
  amount: number;
  status: string;
};

type PaymentRequestDetails = Pick<
  PaymentRequestDO,
  "title" | "description" | "amount" | "reference"
> & { provider_name: string };

export async function getPaymentRequestDetails(
  requestId: string
): Promise<PaymentRequestDetails | undefined> {
  "use server";
  const res = await pgpool.query<PaymentRequestDetails>(
    `select pr.title, pr.description, pr.amount, pp.provider_name, pr.reference
      from payment_requests pr
      join payment_providers pp on pr.provider_id = pp.provider_id
      where pr.payment_request_id = $1`,
    [requestId]
  );

  if (!res.rowCount) {
    return undefined;
  }

  return res.rows[0];
}

export async function getUserPaymentRequestDetails(
  userId: string
): Promise<PaymentRequestDetails[]> {
  "use server";

  const res = await pgpool.query<PaymentRequestDetails>(
    `select pr.title, pr.description, pr.amount, pp.provider_name, pr.reference
      from payment_requests pr
      join payment_providers pp on pr.provider_id = pp.provider_id
      where pr.user_id = $1`,
    [userId]
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
};

export async function getUserTransactionDetails(userId: string) {
  "use server"

  const res = await pgpool.query<TransactionDetails>(
    `Select
      t.status,
      u.user_name as citizen_name,
      pr.title,
      pr.amount,
      t.updated_at
    from payment_requests pr
    left join payment_transactions t on pr.payment_request_id = t.payment_request_id
    join users u on t.user_id = u.id
    where pr.user_id = $1
    order by t.updated_at desc`,
    [userId]
  );

  return res.rows
}
