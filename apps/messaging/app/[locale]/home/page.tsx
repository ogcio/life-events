import { Link, Heading, Paragraph } from "@govie-react/ds";
import { getTranslations } from "next-intl/server";

import { Tab, Tabs } from "./Tabs";
import { Table, Tbody, Td, Th, Thead, Tr } from "./Table";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import dayjs from "dayjs";
import { allUrl, baseUrl, unreadUrl } from "./utils";

export default async (props: { searchParams?: { tab?: string } }) => {
  const tHome = await getTranslations("Home");

  const messagingSdk = await AuthenticationFactory.getMessagingClient();
  const userInfo = await AuthenticationFactory.getInstance().getUser();

  const isSeenQuery = props.searchParams?.tab === "unread" ? false : undefined;

  const messages = await messagingSdk.getMessagesForUser(userInfo.id, {
    offset: 0,
    limit: 100,
    isSeen: isSeenQuery,
  });

  return (
    <>
      <Heading>{tHome("header")}</Heading>

      <Tabs>
        <Tab
          active={
            !props.searchParams?.tab || props.searchParams?.tab === "unread"
          }
          href={unreadUrl.href}
        >
          {tHome("unread")}
        </Tab>
        <Tab
          active={Boolean(
            props.searchParams?.tab && props.searchParams?.tab === "all",
          )}
          href={allUrl.href}
        >
          {tHome("all")}
        </Tab>
      </Tabs>

      <Table>
        <Thead>
          <Tr>
            <Th>{tHome("date")}</Th>
            <Th>{tHome("details")}</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {messages.data?.map((message) => (
            <Tr key={message.id}>
              <Td>{dayjs(message.createdAt).format("D MMM YYYY")}</Td>
              <Td>
                <Link
                  href={((messageId) => {
                    const url = new URL(baseUrl);
                    url.pathname = `/home/${messageId}`;
                    return url.href;
                  })(message.id)}
                >
                  {message.subject}
                </Link>
              </Td>
              <Td></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {!messages.data?.length && <Paragraph>{tHome("noMessages")}</Paragraph>}
    </>
  );
};
