import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import HamburgerMenuProvider from "./HamburgerMenuProvider";
import { getMessages } from "next-intl/server";
import LanguageSwitch from "../Header/LanguageSwitch";

type HamburgerProps = {
  userName: string;
  publicServant: boolean;
  locale: string;
};

export default async ({ userName, locale, publicServant }: HamburgerProps) => {
  const messages = await getMessages({ locale });
  const menuMessages = (await messages.Menu) as unknown as AbstractIntlMessages;

  return (
    <NextIntlClientProvider messages={menuMessages}>
      <HamburgerMenuProvider
        userName={userName}
        publicServant={publicServant}
        languageSwitch={<LanguageSwitch theme={"light"} />}
      ></HamburgerMenuProvider>
    </NextIntlClientProvider>
  );
};
