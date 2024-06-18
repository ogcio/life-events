import React from "react";
import { getTranslations } from "next-intl/server";
import {
  buildPaginationLinks,
  errorHandler,
  formatCurrency,
  mapTransactionStatusColorClassName,
  pageToOffset,
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_PAGE_DEFAULT,
} from "../../../../../utils";
import dayjs from "dayjs";
import { PgSessions } from "auth/sessions";
import { RequestDetails } from "./RequestDetails";
import Link from "next/link";
import { EmptyStatus } from "../../../../../components/EmptyStatus";
import { Payments } from "building-blocks-sdk";
import Pagination from "../../../../../components/pagination";
import { routeDefinitions } from "../../../../../routeDefinitions";
import { redirect, RedirectType } from "next/navigation";

export default async function ({
  params: { requestId, locale },
  searchParams: { action, page, limit },
}) {
  const t = await getTranslations("PaymentSetup.Request");
  const { userId } = await PgSessions.get();

  const currentPage = page ? parseInt(page) : PAGINATION_PAGE_DEFAULT;
  const pageLimit = limit ? parseInt(limit) : PAGINATION_LIMIT_DEFAULT;

  const pagination = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
  };

  const { data: transactionsResponse, error } = await new Payments(
    userId,
  ).getPaymentRequestTransactions(requestId, pagination);

  const errors = errorHandler(error);

  if (errors?.limit || errors?.offset) {
    return redirect("/error", RedirectType.replace);
  }

  const url = `/${locale}/${routeDefinitions.paymentSetup.requestDetails.path(requestId)}`;
  const links = buildPaginationLinks(
    url,
    transactionsResponse?.metadata?.links,
  );

  return (
    <div className="table-container">
      <RequestDetails requestId={requestId} action={action} locale={locale} />

      <div style={{ width: "100%" }}>
        <section
          style={{
            margin: "1rem 0",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 className="govie-heading-m">{t("payments")}</h2>

          {transactionsResponse?.data.length === 0 ? (
            <EmptyStatus
              title={t("empty.title")}
              description={t("empty.description")}
            />
          ) : (
            <div>
              <table className="govie-table scrollable-table">
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
              <Pagination links={links} currentPage={currentPage}></Pagination>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
