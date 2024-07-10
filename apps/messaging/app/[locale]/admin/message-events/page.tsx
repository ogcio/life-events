import { Messaging } from "building-blocks-sdk";
import dayjs from "dayjs";
import FlexMenuWrapper from "../PageWithMenuFlexWrapper";
import ds from "design-system";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AuthenticationContextFactory } from "auth/authentication-context-factory";
import { AuthenticationError } from "shared-errors";
import { withContext } from "../../with-context";

async function messageStatus(type: string, status: string) {
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
  }

  if (type === "message_schedule") {
    switch (status) {
      case "successful":
        return (
          <strong className="govie-tag govie-tag--green">
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
          <strong className="govie-tag govie-tag--yellow">
            {t("scheduling")}
          </strong>
        );
      default:
        break;
    }
  }

  return null;
}

export default withContext(
  async (props: { searchParams: { search?: string } }) => {
    const t = await getTranslations("MessageEvents");

    async function submitSearch(formData: FormData) {
      "use server";
      const search = formData.get("textSearch")?.toString();
      redirect(`?search=${search}`);
    }

    const freeSearch = props.searchParams.search;
    const accessToken = await AuthenticationContextFactory.getAccessToken();

    const client = new Messaging(accessToken);
    const { data, error } = await client.getMessageEvents({
      query: { search: freeSearch },
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
              <th className="govie-table__header">{t("tableDateHeader")}</th>
              <th className="govie-table__header">{t("tableStatusHeader")}</th>
              <th className="govie-table__header">{t("tableSubjectHeader")}</th>
              <th className="govie-table__header">
                {t("tableRecipientHeader")}
              </th>
            </tr>
          </thead>
          <tbody className="govie-table__body">
            {data?.map(
              ({
                eventStatus,
                eventType,
                messageId,
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
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </FlexMenuWrapper>
    );
  },
);
