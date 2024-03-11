import { redirect } from "next/navigation";
import Sqids from "sqids";
import { useTranslations } from "next-intl";
import { web } from "../../../../utils";

const sqids = new Sqids({
  minLength: 8,
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
});

type Props = {
  paymentId: number;
  pay: string;
  dateOfPayment: string;
  flow: string;
};

export default function ({ paymentId, flow, pay }: Props) {
  const t = useTranslations("PaymentSuccessful");
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
          <strong>{sqids.encode([paymentId])}</strong>
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
              {web.formatCurrency(parseInt(pay))}
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
