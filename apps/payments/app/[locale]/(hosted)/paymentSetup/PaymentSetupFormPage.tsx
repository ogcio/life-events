import { getTranslations } from "next-intl/server";
import { PaymentRequestDetails } from "./db";
import { Payments } from "building-blocks-sdk";
import { errorHandler, providerTypeToPaymentMethod } from "../../../utils";
import PaymentSetupForm from "./PaymentSetupForm";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import getRequestConfig from "../../../../i18n";

export type ProvidersMap = Map<string, { id: string; name: string }[]>;

async function getRegisteredAccounts(userId: string): Promise<ProvidersMap> {
  const { data: providers, error } = await new Payments(userId).getProviders();

  if (error) {
    errorHandler(error);
  }

  if (!providers) {
    return new Map();
  }

  const accounts = providers.reduce<ProvidersMap>((acc, provider) => {
    const paymentMethod = providerTypeToPaymentMethod[provider.type];
    if (!acc.get(paymentMethod)) {
      acc.set(paymentMethod, []);
    }

    acc.get(paymentMethod)?.push({
      id: provider.id,
      name: provider.name,
    });

    return acc;
  }, new Map());

  return accounts;
}

type PaymentSetupFormPageProps = {
  details?: PaymentRequestDetails;
  userId: string;
  locale: string;
  action: (formData: FormData) => void;
};

export default async function ({
  details,
  userId,
  locale,
  action,
}: PaymentSetupFormPageProps) {
  // const t = await getTranslations("PaymentSetup");
  // const tCommon = await getTranslations("Common");
  const { messages } = await getRequestConfig({ locale });

  const providerAccounts = await getRegisteredAccounts(userId);

  return (
    <NextIntlClientProvider
      messages={messages?.[("PaymentSetup", "Common")] as AbstractIntlMessages}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <PaymentSetupForm
          details={details}
          providerAccounts={providerAccounts}
          action={action}
        ></PaymentSetupForm>
      </div>
    </NextIntlClientProvider>
  );
}
