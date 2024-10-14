import { getTranslations } from "next-intl/server";
import Link from "next/link";
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
import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../PageWrapper";

export default async function ({
  params: { locale },
  searchParams: { page, limit },
}: {
  params: { locale: string };
  searchParams: { page?: string; limit?: string };
}) {
  const t = await getTranslations("PaymentSetup.Payments");
  const tRequestStatus = await getTranslations(
    "PaymentSetup.paymentRequestStatus",
  );

  const currentPage = page ? parseInt(page) : PAGINATION_PAGE_DEFAULT;
  const pageLimit = limit ? parseInt(limit) : PAGINATION_LIMIT_DEFAULT;

  const pagination = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
  };

  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const {
    data: paymentRequestsData,
    error,
    metadata,
  } = await paymentsApi.getPaymentRequests(pagination);

  const errors = errorHandler(error);

  if (errors?.limit || errors?.offset) {
    return redirect("/error", RedirectType.replace);
  }

  const url = `/${locale}/${routeDefinitions.paymentSetup.requests.path()}`;
  const links = buildPaginationLinks(url, metadata?.links);

  const paymentRequests = paymentRequestsData ?? [];

  return (
    <PageWrapper locale={locale} disableOrgSelector={true}>
      <div className="table-container">
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
                    {t("table.recipientAccount")}
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
                      {tRequestStatus(req.status)}
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
      </div>
    </PageWrapper>
  );
}
