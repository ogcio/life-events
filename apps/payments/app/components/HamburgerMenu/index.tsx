import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import HamburgerMenuWrapper from "./HamburgerMenuWrapper";
import { getMessages } from "next-intl/server";

type HamburgerProps = {
  userName: string;
  locale: string;
};

export default async ({ userName, locale }: HamburgerProps) => {
  const messages = await getMessages({ locale });
  const menuMessages = (await messages.Menu) as unknown as AbstractIntlMessages;

  return (
    <NextIntlClientProvider messages={menuMessages}>
      <HamburgerMenuWrapper userName={userName} />
    </NextIntlClientProvider>
  );
};
