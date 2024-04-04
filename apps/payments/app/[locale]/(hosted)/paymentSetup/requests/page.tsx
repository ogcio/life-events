import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PgSessions } from "auth/sessions";
import { formatCurrency } from "../../../../utils";
import { getUserPaymentRequestDetails } from "../db";

export default async function () {
  const [t, { userId }] = await Promise.all([
    getTranslations("PaymentSetup.Payments"),
    PgSessions.get(),
  ]);

  const paymentRequests = await getUserPaymentRequestDetails(userId);

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
          <Link href="create">
            <button
              id="button"
              data-module="govie-button"
              className="govie-button"
            >
              {t("createPayment")}
            </button>
          </Link>
        </div>

        <h2 className="govie-heading-m">{t("paymentRequests")}</h2>
        <table className="govie-table">
          <thead className="govie-table__head">
            <tr className="govie-table__row">
              <th scope="col" className="govie-table__header">
                {t("table.title")}
              </th>
              <th scope="col" className="govie-table__header">
                {t("table.beneficiaryAccount")}
              </th>
              <th scope="col" className="govie-table__header">
                {t("table.reference")}
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
            {paymentRequests.map((req) => (
              <tr className="govie-table__row" key={req.payment_request_id}>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {req.title}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {req.providers
                    .map(({ provider_name }) => provider_name)
                    .join(", ")}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {req.reference}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {formatCurrency(req.amount)}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  <Link
                    className="govie-link"
                    href={`/paymentSetup/requests/${req.payment_request_id}`}
                  >
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
