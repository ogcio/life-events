import { getTranslations } from "next-intl/server";
import Link from "next/link";
import dayjs from "dayjs";
import {
  buildPaginationLinks,
  errorHandler,
  formatCurrency,
  mapTransactionStatusColorClassName,
  pageToOffset,
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_PAGE_DEFAULT,
} from "../../../utils";
import { EmptyStatus } from "../../../components/EmptyStatus";
import Pagination from "../../../components/pagination";
import { routeDefinitions } from "../../../routeDefinitions";
import { notFound, redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import PaymentsMenu from "./PaymentsMenu";
import { headers } from "next/headers";

export default async function ({
  searchParams: { page, limit },
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();
  if (!isPublicServant) return notFound();

  const organizations = await context.getOrganizations();
  const defaultOrgId = await context.getSelectedOrganization();

  const t = await getTranslations("PaymentSetup.Payments");
  const currentPage = page ? parseInt(page) : PAGINATION_PAGE_DEFAULT;
  const pageLimit = limit ? parseInt(limit) : PAGINATION_LIMIT_DEFAULT;

  const pagination = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
  };

  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: transactionsResponse, error } =
    await paymentsApi.getTransactions(pagination);

  const errors = errorHandler(error);

  if (errors?.limit || errors?.offset) {
    return redirect("/error", RedirectType.replace);
  }

  const locale = headers().get("x-next-intl-locale") || "";

  const url = `/${locale}/${routeDefinitions.paymentSetup.path()}`;
  const links = buildPaginationLinks(
    url,
    transactionsResponse?.metadata?.links,
  );

  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <PaymentsMenu
        locale={locale}
        organizations={organizations}
        defaultOrganization={defaultOrgId}
      />
      <div className="table-container">
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
              <Pagination links={links} currentPage={currentPage}></Pagination>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
