import { getTranslations } from "next-intl/server";
import Link from "next/link";
import dayjs from "dayjs";
import { PgSessions } from "auth/sessions";
import { Payments } from "building-blocks-sdk";
import { getUser } from "../../../../../libraries/auth";
import { EmptyStatus } from "../../../../components/EmptyStatus";
import {
  buildPaginationLinks,
  errorHandler,
  formatCurrency,
  mapTransactionStatusColorClassName,
  pageToOffset,
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_PAGE_DEFAULT,
} from "../../../../utils";
import { routeDefinitions } from "../../../../routeDefinitions";
import Pagination from "../../../../components/pagination";

import styles from "./MyPaymentsPage.module.scss";

type Props = {
  params: {
    locale: string;
  };
  searchParams: { page?: string; limit?: string };
};

export default async function (props: Props) {
  const t = await getTranslations("MyPayments");

  let userId;
  if (process.env.USE_LOGTO_AUTH === "true") {
    userId = (await getUser()).id;
  } else {
    userId = (await PgSessions.get()).userId;
  }

  const currentPage = props.searchParams.page
    ? parseInt(props.searchParams.page)
    : PAGINATION_PAGE_DEFAULT;
  const pageLimit = props.searchParams.limit
    ? parseInt(props.searchParams.limit)
    : PAGINATION_LIMIT_DEFAULT;

  const pagination = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
  };

  const { data: transactionsData, error } = await new Payments(
    userId,
  ).getCitizenTransactions(pagination);

  if (error) {
    errorHandler(error);
  }

  const url = `/${props.params.locale}/${routeDefinitions.citizen.transactions.path()}`;
  const links = buildPaginationLinks(url, transactionsData?.metadata?.links);

  const transactions = transactionsData?.data ?? [];

  return (
    <div className={styles.pageWrapper}>
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
            title={t("empty.title")}
            description={t("empty.description")}
          />
        ) : (
          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <table className={`govie-table ${styles.table}`}>
              <thead className="govie-table__head">
                <tr className="govie-table__row">
                  <th scope="col" className="govie-table__header">
                    {t("table.status")}
                  </th>
                  <th scope="col" className="govie-table__header">
                    {t("table.date")}
                  </th>
                  <th scope="col" className="govie-table__header">
                    {t("table.paymentRequestTitle")}
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
                        href={`/${props.params.locale}/${routeDefinitions.citizen.transactionDetails.path(trx.transactionId)}`}
                      >
                        {t("actions.details")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination links={links} currentPage={currentPage}></Pagination>
          </div>
        )}
      </section>
    </div>
  );
}
