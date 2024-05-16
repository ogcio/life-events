import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import TilesButton from "./TilesButton";
import getRequestConfig from "../../../../i18n";

export default async function ({ locale }: { locale: string }) {
  const { messages } = await getRequestConfig({ locale });

  return (
    <NextIntlClientProvider
      messages={messages?.["ServicesTiles"] as AbstractIntlMessages}
    >
      <TilesButton />
    </NextIntlClientProvider>
  );
}
