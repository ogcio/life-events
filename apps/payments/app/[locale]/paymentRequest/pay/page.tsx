import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { formatCurrency } from "../../../utils";
import { pgpool } from "../../../dbConnection";
import { PgSessions } from "auth/sessions";

type Props = {
  searchParams:
    | {
        paymentId: string;
      }
    | undefined;
};

// Need a common place for these types
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
  "title" | "description" | "amount"
> & { provider_name: string };

async function getPaymentRequestDetails(paymentId: string) {
  "use server";

  const res = await pgpool.query<PaymentRequestDetails>(
    `select pr.title, pr.description, pr.amount, pp.provider_name
      from payment_requests pr
      join payment_providers pp on pr.provider_id = pp.provider_id
      where pr.payment_request_id = $1`,
    [paymentId]
  );

  if (!res.rowCount) {
    return undefined;
  }

  return res.rows[0];
}

export default async function Page(props: Props) {
  const notFound = (
    <h1 className="govie-heading-l">Payment request not found</h1>
  );

  if (!props.searchParams?.paymentId) {
    return notFound;
  }

  // Enforce being logged in
  await PgSessions.get()

  const [details, t] = await Promise.all([
    getPaymentRequestDetails(props.searchParams.paymentId),
    getTranslations("PayPaymentRequest"),
  ]);

  if (!details) {
    return notFound;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        marginTop: "1.3rem",
        gap: "2rem",
        alignItems: "center",
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '80%', gap: '2em' }}>
        <h1 className="govie-heading-l">{t("title")}</h1>
        <h2 className="govie-heading-m">
          {t("toPay")}: {formatCurrency(details.amount)}
        </h2>
        <hr className="govie-section-break govie-section-break--visible"></hr>
        <div style={{ margin: '1em 0'}}>
          <div style={{ display: 'flex', gap: '1em', marginBottom: '1em' }}>
            <h3 className='govie-heading-s' style={{ margin: 0 }}>{t('payByBank')}</h3>
            <strong className="govie-tag govie-tag--green">Recommended</strong>
          </div>
          <p className="govie-body">{t('payByBankDescription')}</p>
          <Link href={`/paymentRequest/pay/bank?paymentId=${props.searchParams.paymentId}`}>
            <button className='govie-button govie-button--primary'>{t('payNow')}</button>
          </Link>
        </div>
        <hr className="govie-section-break govie-section-break--visible"></hr>
        <div style={{ margin: '1em 0'}}>
          <h3 className='govie-heading-s'>{t('payByCard')}</h3>
        </div>
      </div>
    </div>
  );
}
