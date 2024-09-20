import { Heading, Paragraph } from "@govie-react/ds";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

import "./tmp.css";
import { getTranslations } from "next-intl/server";
import { unreadUrl } from "../utils";
import { notFound } from "next/navigation";

type Props = {
  params: { messageId: string };
};

export default async function inboxMessage(props: Props) {
  const messagingSdk = await AuthenticationFactory.getMessagingClient();
  const message = await messagingSdk.getMessage(props.params.messageId);

  if (!message.data) {
    throw notFound();
  }
  const tPanel = await getTranslations("Home");

  // We'll mark as see if we open the page.
  await messagingSdk.seeMessage(props.params.messageId);

  return (
    <>
      <Heading>{message.data?.subject}</Heading>
      <Paragraph size="sm">{message.data?.excerpt}</Paragraph>
      <Paragraph size="md">{message.data?.plainText}</Paragraph>
      <a className="govie-back-link" href={unreadUrl.href}>
        {tPanel("backLink")}
      </a>
    </>
  );
}
