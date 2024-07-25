import dayjs from "dayjs";
import FlexMenuWrapper from "../PageWithMenuFlexWrapper";
import ds from "design-system";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

function pagingMeta(count: number, page: number, size: number) {
  const maxPage = Math.ceil(count / size);
  const nextPage = page + 1;
  const prevPage = page - 1;

  return {
    leftDots: prevPage > 2,
    rightDots: maxPage - nextPage > 1,
    minPage: prevPage === 1 || page === 1 ? undefined : 1,
    prevPage: !prevPage ? undefined : prevPage,
    currentPage: page,
    nextPage: maxPage - nextPage < 1 ? undefined : nextPage,
    maxPage: page === maxPage ? undefined : maxPage,
  };
}

export async function messageStatus(type: string, status: string) {
  const t = await getTranslations("MessageEvents.status");
  if (type === "message_delivery") {
    if (status === "successful") {
      return (
        <strong className="govie-tag govie-tag--green">{t("delivered")}</strong>
      );
    }

    if (status === "failed") {
      return (
        <strong className="govie-tag govie-tag--red">
          {t("deliveredFailed")}
        </strong>
      );
    }

    if (status === "pending") {
      return (
        <strong className="govie-tag govie-tag--yellow">
          {t("delivering")}
        </strong>
      );
    }
  } else if (type === "message_schedule") {
    switch (status) {
      case "successful":
        return (
          <strong className="govie-tag govie-tag--blue">
            {t("scheduled")}
          </strong>
        );
      case "failed":
        return (
          <strong className="govie-tag govie-tag--red">
            {t("schedulingFailed")}
          </strong>
        );
      case "pending":
        return (
          <strong className="govie-tag govie-tag--blue">
            {t("scheduling")}
          </strong>
        );
      default:
        break;
    }
  } else if (type === "message_create") {
    switch (status) {
      case "successful":
        return (
          <strong className="govie-tag govie-tag--grey">{t("created")}</strong>
        );

      default:
        break;
    }
  } else if (type === "sms_delivery") {
    switch (status) {
      case "successful":
        return (
          <strong className="govie-tag govie-tag--green">
            {t("smslDelivered")}
          </strong>
        );
      case "failed":
        return (
          <strong className="govie-tag govie-tag--red">{t("smsFailed")}</strong>
        );
    }
  } else if (type === "email_delivery") {
    switch (status) {
      case "successful":
        return (
          <strong className="govie-tag govie-tag--green">
            {t("emaillDelivered")}
          </strong>
        );
      case "failed":
        return (
          <strong className="govie-tag govie-tag--red">
            {t("emailFailed")}
          </strong>
        );
    }
  }

  return null;
}

export default async (props: {
  searchParams: { search?: string; page?: number; size?: number };
}) => {
  const t = await getTranslations("MessageEvents");

  async function submitSearch(formData: FormData) {
    "use server";
    const search = formData.get("textSearch")?.toString();
    redirect(`?search=${search}`);
  }

  const freeSearch = props.searchParams.search;
  const page = Number(props.searchParams.page) || 1;
  const size = Number(props.searchParams.size) || 20;

  const client = await AuthenticationFactory.getMessagingClient();

  const { data, error, metadata } = await client.getMessageEvents({
    search: freeSearch,
    limit: size,
    offset: (page - 1) * size,
  });

  if (error) {
    return (
      <FlexMenuWrapper>
        <h1>
          <span style={{ margin: "unset" }} className="govie-heading-xl">
            {t("mainHeader")}
          </span>
        </h1>
        <p className="govie-body">{t("failedToFetchParagraph")}</p>
      </FlexMenuWrapper>
    );
  }
  const paging = pagingMeta(metadata?.totalCount || 0, page, size);

  return (
    <FlexMenuWrapper>
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-xl">
          {t("mainHeader")}
        </span>
      </h1>
      <form action={submitSearch}>
        <div className="govie-form-group">
          <div className="govie-input__wrapper">
            <input
              type="text"
              id="textSearch"
              name="textSearch"
              className="govie-input"
              autoComplete="off"
              defaultValue={props.searchParams.search || ""}
              autoFocus
              placeholder={t("searchPlaceholder")}
            />
            <button
              aria-hidden="true"
              className="govie-input__suffix"
              style={{
                background: ds.colours.ogcio.gold,
                borderColor: ds.colours.ogcio.gold,
              }}
            >
              <ds.Icon icon="search" color={ds.colours.ogcio.white} />
            </button>
          </div>
        </div>
      </form>
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th className="govie-table__header">{t("tableScheduledHeader")}</th>
            <th className="govie-table__header">{t("tableStatusHeader")}</th>
            <th className="govie-table__header">{t("tableSubjectHeader")}</th>
            <th className="govie-table__header">{t("tableRecipientHeader")}</th>
            <th className="govie-table__header">{t("tableViewHeader")}</th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {data?.map(
            ({
              eventStatus,
              eventType,
              messageId,
              eventId,
              scheduledAt,
              receiverFullName,
              subject,
            }) => {
              return (
                <tr className="govie-table__row" key={messageId}>
                  <td className="govie-table__cell">
                    {scheduledAt
                      ? dayjs(scheduledAt).format("DD/MM/YYYY")
                      : "n/a"}
                  </td>
                  <td className="govie-table__cell">
                    {messageStatus(eventType, eventStatus)}
                  </td>
                  <td className="govie-table__cell">{subject}</td>
                  <td className="govie-table__cell">{receiverFullName}</td>
                  <td className="govie-table__cell">
                    <Link
                      href={
                        new URL(
                          `/en/admin/message-events/${eventId}`,
                          process.env.HOST_URL,
                        ).href
                      }
                    >
                      {t("viewLink")}
                    </Link>
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>

      <nav
        aria-label="navigation results"
        role="navigation"
        className="govie-pagination"
      >
        <div className="govie-pagination__prev">
          <Link
            className="govie-link govie-pagination__link"
            href={(() => {
              if (page === 1) {
                return "";
              }
              return (
                "?" +
                new URLSearchParams({
                  page: (page - 1).toString(),
                  size: size.toString(),
                }).toString()
              );
            })()}
          >
            <svg
              className="govie-pagination__icon govie-pagination__icon--prev"
              xmlns="http://www.w3.org/2000/svg"
              height="13"
              width="15"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 15 13"
            >
              <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
            </svg>
            <span className="govie-pagination__link-title">
              {t("prevPage")}
            </span>
          </Link>
        </div>

        <ul className="govie-pagination__list">
          {paging.minPage ? (
            <li className="govie-pagination__item">
              <a
                className="govie-link govie-pagination__link"
                href={
                  "?" +
                  new URLSearchParams({
                    page: paging.minPage.toString(),
                    size: size.toString(),
                  }).toString()
                }
                aria-label="Page 1"
                aria-current="page"
              >
                {paging.minPage}
              </a>
            </li>
          ) : null}

          {paging.leftDots && (
            <li className="govie-pagination__item govie-pagination__item--ellipses">
              ⋯
            </li>
          )}

          {paging.prevPage ? (
            <li className="govie-pagination__item">
              <Link
                className="govie-link govie-pagination__link"
                href={
                  "?" +
                  new URLSearchParams({
                    page: paging.prevPage.toString(),
                    size: size.toString(),
                  }).toString()
                }
                aria-label="Page 2"
                aria-current="page"
              >
                {paging.prevPage}
              </Link>
            </li>
          ) : null}
          <li className="govie-pagination__item govie-pagination__item--current">
            <a
              className="govie-link govie-pagination__link"
              href=""
              aria-current="page"
            >
              {paging.currentPage}
            </a>
          </li>

          {paging.nextPage ? (
            <li className="govie-pagination__item">
              <Link
                className="govie-link govie-pagination__link"
                href={
                  "?" +
                  new URLSearchParams({
                    page: paging.nextPage.toString(),
                    size: size.toString(),
                  }).toString()
                }
                aria-label="Page 4"
                aria-current="page"
              >
                {paging.nextPage}
              </Link>
            </li>
          ) : null}

          {paging.rightDots && (
            <li className="govie-pagination__item govie-pagination__item--ellipses">
              ⋯
            </li>
          )}
          {paging.maxPage ? (
            <li className="govie-pagination__item">
              <Link
                className="govie-link govie-pagination__link"
                href={
                  "?" +
                  new URLSearchParams({
                    page: paging.maxPage.toString(),
                    size: size.toString(),
                  }).toString()
                }
                aria-label="Page 5"
                aria-current="page"
              >
                {paging.maxPage}
              </Link>
            </li>
          ) : null}
        </ul>
        <div className="govie-pagination__next">
          <Link
            className="govie-link govie-pagination__link"
            href={(() => {
              if (!paging.maxPage || page === paging.maxPage) {
                return "";
              }
              return (
                "?" +
                new URLSearchParams({
                  page: (page + 1).toString(),
                  size: size.toString(),
                }).toString()
              );
            })()}
          >
            <span className="govie-pagination__link-title">
              {t("nextPage")}
            </span>
            <svg
              className="govie-pagination__icon govie-pagination__icon--next"
              xmlns="http://www.w3.org/2000/svg"
              height="13"
              width="15"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 15 13"
            >
              <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
            </svg>
          </Link>
        </div>
      </nav>
    </FlexMenuWrapper>
  );
};
