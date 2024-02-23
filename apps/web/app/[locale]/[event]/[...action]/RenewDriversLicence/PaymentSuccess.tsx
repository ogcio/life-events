import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";

type Props = {
  totalFeePaid: string;
  dateOfPayment: string;
  flow: string;
};

export default (props: Props) => {
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
          <strong>{t("panelReferenceNumber")}</strong>
        </div>
      </div>
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <p className="govie-body">{t("body")}</p>
        <div className="govie-heading-m">{t("summaryTitle")}</div>
        <dl className="govie-summary-list">
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("paymentFor")}</dt>
            <dd className="govie-summary-list__value">{t(props.flow)}</dd>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("totalFeePaid")}</dt>
            <dd className="govie-summary-list__value">€{props.totalFeePaid}</dd>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">
              {t("dateOfTransaction")}
            </dt>
            <dd className="govie-summary-list__value">{props.dateOfPayment}</dd>
          </div>
        </dl>
        <form action={returnToPortalAction}>
          <button className="govie-button">{t("submitText")}</button>
        </form>
      </div>
    </>
  );
};
