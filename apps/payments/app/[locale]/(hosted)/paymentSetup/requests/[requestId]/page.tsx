import React from "react";
import { getTranslations } from "next-intl/server";
import {
  getPaymentRequestDetails,
  getRequestTransactionDetails,
} from "../../db";
import { formatCurrency } from "../../../../../utils";
import { pgpool } from "../../../../../dbConnection";
import { redirect } from "next/navigation";
import dayjs from "dayjs";

async function createTransaction(requestId: string, formData: FormData) {
  "use server";

  const userId = formData.get("user_id");
  await pgpool.query<{ transaction_id: number }>(
    `
    insert into payment_transactions (payment_request_id, user_ppsn, status, created_at, updated_at)
    values ($1, $2, 'assigned', now(), now());
    `,
    [requestId, userId],
  );

  // reload the page
  redirect(requestId);
}

const RequestDetails = async ({ requestId }: { requestId: string }) => {
  const details = await getPaymentRequestDetails(requestId);
  const t = await getTranslations("PaymentSetup.CreatePayment");
  const tSetup = await getTranslations("PaymentSetup");

  if (!details) {
    return <h1 className="govie-heading-l">Payment request not found</h1>;
  }

  return (
    <>
      <h2 className="govie-heading-m">{tSetup("details")}</h2>
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
    </>
  );
};

export default async function ({ params: { requestId } }) {
  const t = await getTranslations("PaymentSetup.Request");

  const transactions = await getRequestTransactionDetails(requestId);
  const handleSubmit = createTransaction.bind(this, requestId);

  return (
    <div>
      <RequestDetails requestId={requestId} />
      <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
        <section
          style={{
            margin: "1rem 0",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 className="govie-heading-m">{t("transactions")}</h2>
          <table className="govie-table">
            <thead className="govie-table__head">
              <tr className="govie-table__row">
                <th scope="col" className="govie-table__header">
                  {t("table.status")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.date")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.payee")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.paymentTitle")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.amount")}
                </th>
              </tr>
            </thead>
            <tbody className="govie-table__body">
              {transactions.map((trx) => (
                <tr className="govie-table__row">
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    <strong className="govie-tag govie-tag--green govie-body-s">
                      {trx.status}
                    </strong>
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {dayjs(trx.updated_at).format("DD/MM/YYYY")}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {trx.citizen_name || "-"}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {trx.title}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {formatCurrency(trx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <div>
        <h2 className="govie-heading-m">{t("assignTitle")}</h2>
        <p className="govie-body">{t("assignDescription")}</p>
        <form action={handleSubmit}>
          <div className="govie-form-group">
            <label className="govie-label--s" htmlFor="provider_name">
              {t("userPpsn")}{" "}
            </label>
            <div className="govie-hint">{t("userPpsnHint")}</div>
            <input
              type="text"
              id="user_ppsn"
              name="user_ppsn"
              className="govie-input"
            />
          </div>
          <button
            id="button"
            type="submit"
            data-module="govie-button"
            className="govie-button"
          >
            {t("confirm")}
          </button>
        </form>
      </div>
    </div>
  );
}
