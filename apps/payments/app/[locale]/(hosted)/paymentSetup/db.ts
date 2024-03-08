import { pgpool } from "../../../dbConnection";

type PaymentRequestDO = {
  payment_request_id: string;
  user_id: string;
  title: string;
  description: string;
  reference: string;
  amount: number;
  status: string;
  redirect_url: string;
};

type PaymentRequestDetails = Pick<
  PaymentRequestDO,
  "payment_request_id" | "title" | "description" | "amount" | "reference" | "redirect_url"
> & { providers: {provider_name: string, provider_type: string}[] };

export async function getPaymentRequestDetails(
  requestId: string
): Promise<PaymentRequestDetails | undefined> {
  "use server";
  const res = await pgpool.query<PaymentRequestDetails>(
    `select pr.title, pr.payment_request_id, pr.description, pr.amount, json_agg(pp) as providers, pr.reference, pr.redirect_url
      from payment_requests pr
      join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id
      join payment_providers pp on ppr.provider_id = pp.provider_id
      where pr.payment_request_id = $1
      group by pr.payment_request_id`,
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
    `select pr.title, pr.payment_request_id, pr.description, pr.amount, pr.reference, json_agg(pp) as providers
      from payment_requests pr
      join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id
      join payment_providers pp on ppr.provider_id = pp.provider_id
      where pr.user_id = $1
      group by pr.payment_request_id`,
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
    from payment_transactions t
    left join payment_requests pr on pr.payment_request_id = t.payment_request_id
    left join users u on t.user_id = u.id
    where pr.user_id = $1
    order by t.updated_at desc`,
    [userId]
  );

  return res.rows
}

export async function getRequestTransactionDetails(requestId: string) {
  "use server"

  const res = await pgpool.query<TransactionDetails>(
    `Select
      t.status,
      u.user_name as citizen_name,
      pr.title,
      pr.amount,
      t.updated_at
    from payment_transactions t
    inner join payment_requests pr on pr.payment_request_id = t.payment_request_id
    left join users u on t.user_id = u.id
    where pr.payment_request_id = $1
    order by t.updated_at desc`,
    [requestId]
  );

  return res.rows
}
