import React from "react";
import { getTranslations } from "next-intl/server";
import { getPaymentRequestDetails } from "../../db";
import { formatCurrency } from "../../../../../utils";
import { pgpool } from "../../../../../dbConnection";
import { redirect } from "next/navigation";
import Link from "next/link";
import Tooltip from "../../../../../components/Tooltip";
import CopyLink from "./CopyBtn";

async function deletePaymentRequest(requestId: string) {
  "use server";

  await pgpool.query(
    `
    delete from payment_requests where payment_request_id = $1
    `,
    [requestId],
  );

  redirect("/paymentSetup/requests");
}

async function hasTransactions(requestId: string) {
  const { rows } = await pgpool.query<{ transaction_id: number }>(
    `
    select transaction_id from payment_transactions where payment_request_id = $1
    `,
    [requestId],
  );

  return rows.length > 0;
}

export const RequestDetails = async ({ requestId }: { requestId: string }) => {
  const details = await getPaymentRequestDetails(requestId);
  const t = await getTranslations("PaymentSetup.CreatePayment");
  const tSetup = await getTranslations("PaymentSetup");
  const tCommon = await getTranslations("Common");

  if (!details) {
    return <h1 className="govie-heading-l">Payment request not found</h1>;
  }

  const deletePR = deletePaymentRequest.bind(this, details.payment_request_id);
  // Cannot delete the payment request if we already have transactions
  const disableDeleteButton = await hasTransactions(requestId);

  const integrationReference = requestId;
  const completePaymentLink = new URL(
    `/paymentRequest/pay?paymentId=${requestId}&id=${integrationReference}`,
    process.env.HOST_URL ?? "",
  ).toString();

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 className="govie-heading-m">{tSetup("details")}</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <Link href={`/paymentSetup/edit/${requestId}`}>
            <button className="govie-button govie-button--secondary">
              {tCommon("edit")}
            </button>
          </Link>
          {disableDeleteButton ? (
            <Tooltip
              text={tSetup("Request.actions.delete.cannotDelete")}
              width="300px"
            >
              <button className="govie-button govie-button--tertiary" disabled>
                {tCommon("delete")}
              </button>
            </Tooltip>
          ) : (
            <form action={deletePR}>
              <button className="govie-button govie-button--tertiary">
                {tCommon("delete")}
              </button>
            </form>
          )}
        </div>
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
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">
            {t("form.allowCustomAmount")}
          </dt>
          <dt className="govie-summary-list__value">
            {JSON.stringify(details.allowCustomAmount)}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("paymentLink")}</dt>
          <dt className="govie-summary-list__value">
            <div style={{ display: "flex", gap: "10px" }}>
              <a href={completePaymentLink} className="govie-link">
                {completePaymentLink}
              </a>
              <CopyLink link={completePaymentLink} buttonText={t("copyLink")} />
            </div>
          </dt>
        </div>
      </dl>
    </>
  );
};
