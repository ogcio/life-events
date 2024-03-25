import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PgSessions } from "auth/sessions";
import { getUserTransactionDetails } from "./../../db";
import { formatCurrency } from "../../../../../utils";
import { pgpool } from "../../../../../dbConnection";

type TransactionDetails = {
  status: string;
  title: string;
  amount: number;
  updated_at: string;
};

export async function getTransactionDetails(transactionId: string) {
  const res = await pgpool.query<TransactionDetails>(
    `
    SELECT
      t.status,
      pr.title,
      t.amount,
      t.updated_at
    FROM payment_transactions t
    LEFT JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
    WHERE t.transaction_id = $1
  `,
    [transactionId],
  );
  return res.rows[0];
}

export default async function ({ params: { transactionId } }) {
  const [t, details] = await Promise.all([
    getTranslations("PaymentSetup.Payments"),
    getTransactionDetails(transactionId),
  ]);

  console.log(details);

  return <h1>{JSON.stringify(details, null, 2)}</h1>;
}
