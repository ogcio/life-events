import React from "react";
import { getTranslations } from "next-intl/server";
import {
  formatCurrency,
  mapTransactionStatusColorClassName,
} from "../../../../../utils";
import dayjs from "dayjs";
import { PgSessions } from "auth/sessions";
import { RequestDetails } from "./RequestDetails";
import Link from "next/link";
import buildApiClient from "../../../../../../client/index";
import { EmptyStatus } from "../../../../../components/EmptyStatus";

export default async function ({ params: { requestId } }) {
  const t = await getTranslations("PaymentSetup.Request");

  const { userId } = await PgSessions.get();

  let transactions: Array<any> = [];
  try {
    transactions = (
      await buildApiClient(
        userId,
      ).transactions.apiV1RequestsRequestIdTransactionsGet(requestId)
    ).data;
  } catch (err) {
    console.log(err);
  }

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
          <h2 className="govie-heading-m">{t("payments")}</h2>

          {transactions.length === 0 ? (
            <EmptyStatus
              title={t("empty.title")}
              description={t("empty.description")}
            />
          ) : (
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
                    {t("table.amount")}
                  </th>
                  <th scope="col" className="govie-table__header">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="govie-table__body">
                {transactions.map((trx) => (
                  <tr className="govie-table__row" key={trx.transactionId}>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      <strong
                        className={`govie-tag ${mapTransactionStatusColorClassName(trx.status)} govie-body-s`}
                        style={{ marginBottom: "0px" }}
                      >
                        {trx.status}
                      </strong>
                    </td>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      {dayjs(trx.updatedAt).format("DD/MM/YYYY")}
                    </td>

                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      {formatCurrency(trx.amount)}
                    </td>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      <Link href={`../transaction/${trx.transactionId}`}>
                        {t("table.details")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
