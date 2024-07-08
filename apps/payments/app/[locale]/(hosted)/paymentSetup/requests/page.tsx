import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Payments } from "building-blocks-sdk";
import { EmptyStatus } from "../../../../components/EmptyStatus";
import {
  buildPaginationLinks,
  errorHandler,
  formatCurrency,
  pageToOffset,
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_PAGE_DEFAULT,
} from "../../../../utils";
import { routeDefinitions } from "../../../../routeDefinitions";
import Pagination from "../../../../components/pagination";
import styles from "./PaymentRequests.module.scss";
import { notFound, redirect, RedirectType } from "next/navigation";
import { getPaymentsPublicServantContext } from "../../../../../libraries/auth";

export default async function ({
  params: { locale },
  searchParams: { page, limit },
}: {
  params: { locale: string };
  searchParams: { page?: string; limit?: string };
}) {
  const t = await getTranslations("PaymentSetup.Payments");

  const { accessToken } = await getPaymentsPublicServantContext();

  if (!accessToken) {
    return notFound();
  }

  const currentPage = page ? parseInt(page) : PAGINATION_PAGE_DEFAULT;
  const pageLimit = limit ? parseInt(limit) : PAGINATION_LIMIT_DEFAULT;

  const pagination = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
  };

  const { data: paymentRequestsData, error } = await new Payments(
    accessToken,
  ).getPaymentRequests(pagination);

  const errors = errorHandler(error);

  if (errors?.limit || errors?.offset) {
    return redirect("/error", RedirectType.replace);
  }

  const url = `/${locale}/${routeDefinitions.paymentSetup.requests.path()}`;
  const links = buildPaginationLinks(url, paymentRequestsData?.metadata?.links);

  const paymentRequests = paymentRequestsData?.data ?? [];

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
          <div>
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
                    {t("table.status")}
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
                      {req.status}
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
            <Pagination links={links} currentPage={currentPage}></Pagination>
          </div>
        )}
      </section>
    </div>
  );
}
