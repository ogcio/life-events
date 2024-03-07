import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Sqids from "sqids";

import { pgpool } from "../../../../dbConnection";
import { formatCurrency } from "../../../../utils";
import PaymentError from "./PaymentError";

const sqids = new Sqids({
  minLength: 8,
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
});

export type PaymentSuccessProps = {
  searchParams?: {
    transactionId: string;
    id: string;
    pay: string;
    status: string;
  };
};

async function updateFlow(userId: string, flow: string, pay: string) {
  "use server";

  // Let's just assume everything is fantastic
  await pgpool.query(
    `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('paymentId', gen_random_uuid()::text, 'totalFeePaid', $1::text, 'dateOfPayment', now()::date::text)
        WHERE user_id=$2 AND flow = $3
    `,
    [pay, userId, flow]
  );
}

export default async function (props: PaymentSuccessProps) {
  if (!props.searchParams) {
    return redirect("/events");
  }

  const { transactionId, id, pay, status } = props.searchParams;

  if (status !== "executed") {
    // update the DB?
    return <PaymentError />;
  }

  const [userId, flow] = id.split(":");

  const [t] = await Promise.all([
    getTranslations("PaymentSuccessful"),
    updateFlow(userId, flow, pay),
  ]);

  async function returnToPortalAction() {
    "use server";
    redirect("/events");
  }

  return (
    <>
      <div className="govie-panel govie-panel--confirmation">
        <div className="govie-panel__title">{t("panelTitle")}</div>
        <div className="govie-panel__body">
          {t("panelReferenceText")}
          <br />
          <strong>{sqids.encode([parseInt(transactionId)])}</strong>
        </div>
      </div>
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <p className="govie-body">{t("body")}</p>
        <div className="govie-heading-m">{t("summaryTitle")}</div>
        <dl className="govie-summary-list">
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("paymentFor")}</dt>
            <dd className="govie-summary-list__value">{t(flow)}</dd>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("totalFeePaid")}</dt>
            <dd className="govie-summary-list__value">
              {formatCurrency(parseInt(pay))}
            </dd>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">
              {t("dateOfTransaction")}
            </dt>
            <dd className="govie-summary-list__value">
              {new Date().toLocaleDateString()}
            </dd>
          </div>
        </dl>
        <form action={returnToPortalAction}>
          <button className="govie-button">{t("submitText")}</button>
        </form>
      </div>
    </>
  );
}
