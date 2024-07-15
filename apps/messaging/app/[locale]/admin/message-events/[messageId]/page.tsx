import { PgSessions } from "auth/sessions";
import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";
import { Messaging } from "building-blocks-sdk";
import { messageStatus } from "../page";

// function isCreateEvent(data:unknown): data is

export default async (props: { params: { messageId: string } }) => {
  const { userId } = await PgSessions.get();
  const messagingClient = new Messaging(userId);
  const messageEvents = await messagingClient.getMessageEvent(
    props.params.messageId,
  );

  let recipient: string = "";
  let subject: string = "";
  let excerpt = "";
  let plainText = "";
  for (const event of messageEvents.data || []) {
    if ("receiverFullName" in event.data) {
      recipient = event.data.receiverFullName;
      subject = event.data.subject;
      excerpt = event.data.excerpt;
      plainText = event.data.plainText;
      break;
    }
  }

  console.log(JSON.stringify(messageEvents));
  return (
    <FlexMenuWrapper>
      <h1>Message {subject}</h1>
      <h2>Recipient - {recipient}</h2>

      <p>{excerpt}</p>
      <p>{plainText}</p>
      {messageEvents.data?.map(async (item) => (
        <div
          key={item.eventStatus + item.eventType}
          style={{ background: "pink", margin: "15px" }}
        >
          <div>
            {(await messageStatus(item.eventType, item.eventStatus)) ||
              `${item.eventType} - ${item.eventStatus}`}
          </div>

          <div>{item.createdAt}</div>
        </div>
      ))}
    </FlexMenuWrapper>
  );
};
