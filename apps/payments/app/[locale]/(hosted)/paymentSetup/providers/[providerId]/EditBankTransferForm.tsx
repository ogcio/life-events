import { redirect } from "next/navigation";
import type { BankTransferProvider } from "../types";
import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import buildApiClient from "../../../../../../client/index";
import getRequestConfig from "../../../../../../i18n";
import BankTransferForm from "../add-banktransfer/BankTransferForm";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";

type Props = {
  provider: BankTransferProvider;
  locale: string;
};

export default async ({ provider, locale }: Props) => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");
  const { messages } = await getRequestConfig({ locale });

  async function updateProvider(
    prev: FormData,
    formData: FormData,
  ): Promise<{ errors: { [key: string]: string } }> {
    "use server";

    const { userId } = await PgSessions.get();

    const providerName = formData.get("provider_name") as string;
    const iban = formData.get("iban");
    const accountHolderName = formData.get("account_holder_name");
    const providerData = {
      iban,
      accountHolderName,
    };

    await buildApiClient(userId).providers.apiV1ProvidersProviderIdPut(
      provider.id,
      {
        name: providerName,
        data: providerData,
        status: provider.status,
      },
    );

    redirect("./");
  }

  return (
    <NextIntlClientProvider
      messages={messages?.["PaymentSetup"] as AbstractIntlMessages}
    >
      <BankTransferForm
        action={updateProvider}
        defaultState={{
          providerName: provider.name,
          accountHolderName: provider.data.accountHolderName,
          iban: provider.data.iban,
        }}
      />
    </NextIntlClientProvider>
  );
};
