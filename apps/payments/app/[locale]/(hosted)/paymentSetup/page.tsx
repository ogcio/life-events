import { getTranslations } from "next-intl/server";
import Link from "next/link";
import dayjs from "dayjs";
import { PgSessions } from "auth/sessions";
import {
  buildPaginationLinks,
  errorHandler,
  formatCurrency,
  mapTransactionStatusColorClassName,
  pageToOffset,
} from "../../../utils";
import { getUser } from "../../../../libraries/auth";
import { EmptyStatus } from "../../../components/EmptyStatus";
import { Payments } from "building-blocks-sdk";
import Pagination from "../../../components/pagination";
import { routeDefinitions } from "../../../routeDefinitions";

export default async function ({
  params: { locale },
  searchParams: { page, limit },
}: {
  params: { locale: string };
  searchParams: { page?: number; limit?: number };
}) {
  const t = await getTranslations("PaymentSetup.Payments");
  let userId;
  const pagination = {
    offset: pageToOffset(page ?? 1, limit ?? 10),
    limit,
  };

  if (process.env.USE_LOGTO_AUTH === "true") {
    userId = (await getUser()).id;
  } else {
    userId = (await PgSessions.get()).userId;
  }

  //Let's assume Logto is not enabled yet
  const sessionId = (await PgSessions.get()).sessionId;

  const { data: transactionsResponse, error } = await new Payments(
    sessionId,
  ).getTransactions(pagination);

  if (error) {
    errorHandler(error);
  }

  const url = `/${locale}/${routeDefinitions.paymentSetup.path()}`;
  const links = buildPaginationLinks(url, transactionsResponse?.metadata.links);
  console.log(links);
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
        {transactionsResponse?.data.length === 0 ? (
          <EmptyStatus
            title={t("emptyPaymentsList.title")}
            description={t("emptyPaymentsList.description")}
            action={
              <Link href={`/${locale}/paymentSetup/providers`}>
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
          <div>
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
                {transactionsResponse?.data.map((trx) => (
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
                      {dayjs(trx.updatedAt).format("DD/MM/YYYY - HH:mm")}
                    </td>

                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      {trx.title}
                    </td>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      {formatCurrency(trx.amount)}
                    </td>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      <Link
                        href={`/${locale}/paymentSetup/transaction/${trx.transactionId}`}
                      >
                        {t("table.details")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination links={links}></Pagination>
          </div>
        )}
      </section>
    </div>
  );
}
