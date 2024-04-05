import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getUserTransactionDetails } from "./db";
import { formatCurrency } from "../../../utils";
import { getUser } from "../../../../libraries/auth";

export default async function () {
  const [t, user] = await Promise.all([
    getTranslations("PaymentSetup.Payments"),
    getUser(),
  ]);

  const transactions = await getUserTransactionDetails();

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
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="paymentSetup/create">
            <button
              id="button"
              data-module="govie-button"
              className="govie-button"
            >
              {t("createPayment")}
            </button>
          </Link>
        </div>
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
            {transactions.map((trx) => (
              <tr className="govie-table__row" key={trx.transaction_id}>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  <strong className="govie-tag govie-tag--green govie-body-s">
                    {trx.status}
                  </strong>
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {new Date(trx.updated_at).toLocaleDateString()}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {trx.title}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {formatCurrency(trx.amount)}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  <Link href={`paymentSetup/transaction/${trx.transaction_id}`}>
                    {t("table.details")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
