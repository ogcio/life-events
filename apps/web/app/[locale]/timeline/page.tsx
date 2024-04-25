import { PgSessions } from "auth/sessions";
import { web } from "../../utils";
import Timeline from "./Timeline";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async (props: web.NextPageProps) => {
  const { firstName, lastName } = await PgSessions.get();

  const userName = [firstName, lastName].join(" ");

  const messages = await getMessages({ locale: props.params.locale });
  const timelineMessages = messages.Timeline as AbstractIntlMessages;

  return (
    <div
      style={{
        display: "flex",
        margin: "1.3rem 0",
        gap: "2.5rem",
      }}
    >
      <NextIntlClientProvider messages={timelineMessages}>
        <Timeline
          userName={userName}
          searchParams={props.searchParams}
          locale={props.params.locale}
        />
      </NextIntlClientProvider>
    </div>
  );
};
