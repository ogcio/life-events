import React from "react";
import { getTranslations } from "next-intl/server";
import { getRequestTransactionDetails } from "../../db";
import { formatCurrency } from "../../../../../utils";
import { pgpool } from "../../../../../dbConnection";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import CopyLink from "./CopyBtn";
import { PgSessions } from "auth/sessions";
import { RequestDetails } from "./RequestDetails";
import Link from "next/link";

export default async function ({ params: { requestId } }) {
  const t = await getTranslations("PaymentSetup.Request");
  const tCreatePayment = await getTranslations("PaymentSetup.CreatePayment");

  const { userId } = await PgSessions.get();

  const transactions = await getRequestTransactionDetails(requestId);

  const integrationReference = `${userId}:${requestId}`;
  const completePaymentLink = new URL(
    `/paymentRequest/pay?paymentId=${requestId}&id=${integrationReference}`,
    process.env.HOST_URL ?? "",
  ).toString();

  return (
    <div>
      <RequestDetails requestId={requestId} />

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
            {tCreatePayment("paymentLink")}
          </label>
          <a href={completePaymentLink} className="govie-link">
            {completePaymentLink}
          </a>
        </div>
        <CopyLink
          link={completePaymentLink}
          buttonText={tCreatePayment("copyLink")}
        />
      </div>

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
                  {t("table.paymentTitle")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.amount")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.actions")}
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
                    {trx.title}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {formatCurrency(trx.amount)}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    <Link href={`../transaction/${trx.transaction_id}`}>
                      {t("table.details")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
