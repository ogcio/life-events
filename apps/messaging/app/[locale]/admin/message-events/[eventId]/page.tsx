import { PgSessions } from "auth/sessions";
import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";
import { Messaging } from "building-blocks-sdk";
import { messageStatus } from "../page";
import { getTranslations } from "next-intl/server";
import dayjs from "dayjs";
import Link from "next/link";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

export default async (props: { params: { eventId: string } }) => {
  const t = await getTranslations("MessageEvents");
  const messagingClient = await AuthenticationFactory.getMessagingClient();
  const messageEvents = await messagingClient.getMessageEvent(
    props.params.eventId,
  );

  let recipient: string = "";
  let subject: string = "";
  let excerpt = "";
  let plainText = "";

  for (const event of messageEvents.data || []) {
    console.log({ event });
    if ("receiverFullName" in event.data) {
      recipient = event.data.receiverFullName;
      subject = event.data.subject;
      excerpt = event.data.excerpt;
      plainText = event.data.plainText;
      break;
    }
  }

  return (
    <FlexMenuWrapper>
      <h1>
        <span className="govie-heading-xl" style={{ margin: "unset" }}>
          {t("eventLogMainHeader")}
        </span>
      </h1>
      <h2>
        {t("recipientSubHeader")} - {recipient}
      </h2>

      <p className="govie-body">{excerpt}</p>
      <p className="govie-body">{plainText}</p>
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th className="govie-table__header">{t("tableStatusHeader")}</th>
            <th className="govie-table__header">{t("tableDateHeader")}</th>
            <th className="govie-table__header">{t("tableTimeHeader")}</th>
            <th className="govie-table__header">{t("tableActionHeader")}</th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {messageEvents.data?.map(async (item) => {
            const day = dayjs(item.createdAt);
            return (
              <tr key={item.data.messageId} className="govie-table__row">
                <td className="govie-table__cell">
                  {await messageStatus(item.eventType, item.eventStatus)}
                </td>
                <td className="govie-table__cell">
                  {day.format("YYYY-MM-DD")}
                </td>
                <td className="govie-table__cell">{day.format("HH:MM:ss")}</td>
                <td className="govie-table__cell"></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Link href="./" className="govie-back-link">
        {t("backLink")}
      </Link>
    </FlexMenuWrapper>
  );
};
