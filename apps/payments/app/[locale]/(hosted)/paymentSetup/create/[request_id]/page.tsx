import { getTranslations } from "next-intl/server";

import CopyLink from "./CopyBtn";
import { formatCurrency } from "../../../../../utils";
import Link from "next/link";
import { getPaymentRequestDetails } from "../../db";
import { PgSessions } from "auth/sessions";

export default async function (props: { params: { request_id: string } }) {
  const details = await getPaymentRequestDetails(props.params.request_id);
  const { userId } = await PgSessions.get();
  const t = await getTranslations("PaymentSetup.CreatePayment");
  const tCommon = await getTranslations("Common");

  if (!details) {
    return <h1 className="govie-heading-l">Payment request not found</h1>;
  }

  const integrationReference = `${userId}:${props.params.request_id}`;
  const completePaymentLink = new URL(
    `/paymentRequest/pay?paymentId=${props.params.request_id}&id=${integrationReference}`,
    process.env.HOST_URL ?? "",
  ).toString();

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1 className="govie-heading-l">{t("title")}</h1>
        <Link href={`/paymentSetup/edit/${props.params.request_id}`}>
          <button className="govie-button govie-button--primary">
            {tCommon("edit")}
          </button>
        </Link>
      </div>

      <dl className="govie-summary-list">
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("form.title")}</dt>
          <dt className="govie-summary-list__value">{details.title}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("form.description")}</dt>
          <dt className="govie-summary-list__value">{details.description}</dt>
        </div>

        {details.providers.map(({ provider_name, provider_type }) => (
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">
              {t(`form.paymentProvider.${provider_type}`)}
            </dt>
            <dt className="govie-summary-list__value">{provider_name}</dt>
          </div>
        ))}

        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("form.amount")}</dt>
          <dt className="govie-summary-list__value">
            {formatCurrency(details.amount)}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("form.redirectUrl")}</dt>
          <dt className="govie-summary-list__value">{details.redirect_url}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">
            {t("form.allowAmountOverride")}
          </dt>
          <dt className="govie-summary-list__value">
            {JSON.stringify(details.allowAmountOverride)}
          </dt>
        </div>
      </dl>
      <div
        style={{
          display: "flex",
          columnGap: "2em",
          alignItems: "center",
          marginBottom: "4em",
        }}
      >
        <div>
          <label htmlFor="" className="govie-label">
            {t("paymentLink")}
          </label>
          <a href={completePaymentLink} className="govie-link">
            {completePaymentLink}
          </a>
        </div>
        <CopyLink link={completePaymentLink} buttonText={t("copyLink")} />
      </div>
      <div>
        <Link href="/paymentSetup">
          <button className="govie-button govie-button--secondary">
            {t("goBack")}
          </button>
        </Link>
      </div>
    </div>
  );
}
