import { AuthenticationFactory } from "../../../utils/authentication-factory";
import { getTranslations } from "next-intl/server";
import { allUrl, unreadUrl } from "../utils";
import { notFound } from "next/navigation";
import { Heading, Paragraph } from "@govie-ds/react";
import React from "react";

type Props = {
  params: { messageId: string };
  searchParams?: { tab: "all" | "unread" };
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
      <Paragraph whitespace="pre-wrap" size="sm">
        {message.data?.excerpt}
      </Paragraph>
      <Paragraph whitespace="pre-wrap" size="md">
        {message.data?.plainText}
      </Paragraph>
      <a
        className="govie-back-link"
        href={
          props.searchParams?.tab === "unread" ? unreadUrl.href : allUrl.href
        }
      >
        {tPanel("backLink")}
      </a>
    </>
  );
}
