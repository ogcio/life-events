import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PgSessions } from "auth/sessions";
import { Payments } from "building-blocks-sdk";
import { errorHandler, formatCurrency } from "../../../../utils";
import { EmptyStatus } from "../../../../components/EmptyStatus";
import styles from "./PaymentRequests.module.scss";

export default async function ({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [t, { userId }] = await Promise.all([
    getTranslations("PaymentSetup.Payments"),
    PgSessions.get(),
  ]);

  const { data: paymentRequests = [], error } = await new Payments(
    userId,
  ).getPaymentRequests();

  if (error) {
    errorHandler(error);
  }

  return (
    <div className="table-container">
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className={styles.headingButtonWrapper}>
          <h1 className="govie-heading-m">{t("paymentRequests")}</h1>
          <Link href={`/${locale}/paymentSetup/create`}>
            <button
              id="button"
              data-module="govie-button"
              className="govie-button"
            >
              {t("createPayment")}
            </button>
          </Link>
        </div>

        {paymentRequests.length === 0 ? (
          <EmptyStatus
            title={t("empty.title")}
            description={t("empty.description")}
          />
        ) : (
          <table className="govie-table scrollable-table">
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
                <tr className="govie-table__row" key={req.paymentRequestId}>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {req.title}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {req.providers.map(({ name }) => name).join(", ")}
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
                      href={`/${locale}/paymentSetup/requests/${req.paymentRequestId}`}
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
