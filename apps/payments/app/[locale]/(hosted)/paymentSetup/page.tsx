import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getUser } from "../../../../libraries/auth";
import {
  formatCurrency,
  mapTransactionStatusColorClassName,
} from "../../../utils";

import { EmptyStatus } from "../../../components/EmptyStatus";
import { Payments } from "building-blocks-sdk";

export default async function () {
  const [t, user] = await Promise.all([
    getTranslations("PaymentSetup.Payments"),
    getUser(),
  ]);

  console.log(user);

  const transactions = []; //(await new Payments(userId).getTransactions()).data;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
      <section
        style={{
          margin: "1rem 0",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1 className="govie-heading-m">{t("title")}</h1>
        {transactions?.length === 0 ? (
          <EmptyStatus
            title={t("emptyPaymentsList.title")}
            description={t("emptyPaymentsList.description")}
            action={
              <Link href="/paymentSetup/providers">
                <button
                  id="button"
                  data-module="govie-button"
                  className="govie-button"
                >
                  {t("emptyPaymentsList.startHere")}
                </button>
              </Link>
            }
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
                  {t("table.title")}
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
              {transactions?.map((trx) => (
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
                    {new Date(trx.updatedAt).toLocaleDateString()}
                  </td>

                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {trx.title}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {formatCurrency(trx.amount)}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    <Link
                      href={`paymentSetup/transaction/${trx.transactionId}`}
                    >
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
  );
}
