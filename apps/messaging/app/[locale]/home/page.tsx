import {
  Link,
  Heading,
  Paragraph,
  Tabs,
  TabItem,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableData,
  Icon,
} from "@govie-ds/react";
import { getTranslations } from "next-intl/server";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import dayjs from "dayjs";
import { allUrl, baseUrl, unreadUrl } from "./utils";
import React from "react";

export default async (props: { searchParams?: { tab?: string } }) => {
  const tHome = await getTranslations("Home");

  const messagingSdk = await AuthenticationFactory.getMessagingClient();
  const userInfo = await AuthenticationFactory.getInstance().getUser();

  let shouldGetAllMessages = props.searchParams?.tab === "all";

  const messages = await messagingSdk.getMessagesForUser(userInfo.id, {
    offset: 0,
    limit: 100,
    isSeen: shouldGetAllMessages ? undefined : false,
  });

  return (
    <>
      <Heading>{tHome("header")}</Heading>

      <Tabs>
        <TabItem
          value="unread"
          checked={Boolean(!shouldGetAllMessages)}
          href={unreadUrl.href}
        >
          {tHome("unread")}
        </TabItem>
        <TabItem
          value="all"
          checked={Boolean(Boolean(shouldGetAllMessages))}
          href={allUrl.href}
        >
          {tHome("all")}
        </TabItem>
      </Tabs>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>{tHome("date")}</TableHeader>
            <TableHeader>{tHome("details")}</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.data?.map((message) => (
            <TableRow key={message.id}>
              <TableData>
                {dayjs(message.createdAt).format("D MMM YYYY")}
              </TableData>
              <TableData>
                <Link
                  href={((messageId) => {
                    const url = new URL(baseUrl);
                    url.pathname = `/home/${messageId}`;
                    url.searchParams.append(
                      "tab",
                      shouldGetAllMessages ? "all" : "unread",
                    );
                    return url.href;
                  })(message.id)}
                >
                  {message.subject}
                </Link>
              </TableData>
              <TableData>
                <Icon
                  icon="attach_file"
                  color={message.attachmentsCount ? "default" : "disabled"}
                />
              </TableData>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!messages.data?.length && (
        <Paragraph align="center">{tHome("noMessages")}</Paragraph>
      )}
    </>
  );
};
