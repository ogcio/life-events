import { PaymentRequestDetails } from "./db";
import { Payments } from "building-blocks-sdk";
import { errorHandler, providerTypeToPaymentMethod } from "../../../utils";
import PaymentSetupForm from "./PaymentSetupForm";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import getRequestConfig from "../../../../i18n";
import { ProviderType } from "./providers/types";

export type ProvidersMap = Record<
  string,
  {
    id: string;
    name: string;
    type: ProviderType;
  }[]
>;

async function getRegisteredAccounts(userId: string): Promise<ProvidersMap> {
  const { data: providers, error } = await new Payments(userId).getProviders();

  if (error) {
    errorHandler(error);
  }

  if (!providers) {
    return {};
  }

  const accounts = providers.reduce<ProvidersMap>((acc, provider) => {
    const paymentMethod = providerTypeToPaymentMethod[provider.type];
    if (!acc[paymentMethod]) {
      acc[paymentMethod] = [];
    }

    acc[paymentMethod]?.push({
      id: provider.id,
      name: provider.name,
      type: provider.type,
    });

    return acc;
  }, {});

  return accounts;
}

type PaymentSetupFormPageProps = {
  details?: PaymentRequestDetails;
  userId: string;
  locale: string;
  action: (
    prevState: FormData,
    formData: FormData,
  ) => Promise<{
    errors: {
      [key: string]: string;
    };
    defaultState: {
      details?: Partial<PaymentRequestDetails>;
      providerAccounts: ProvidersMap;
    };
  }>;
};

export default async function ({
  details,
  userId,
  locale,
  action,
}: PaymentSetupFormPageProps) {
  const { messages } = await getRequestConfig({ locale });

  const providerAccounts = await getRegisteredAccounts(userId);

  return (
    <NextIntlClientProvider
      messages={
        {
          PaymentSetup: messages?.["PaymentSetup"],
          Common: messages?.["Common"],
        } as AbstractIntlMessages
      }
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <PaymentSetupForm
          action={action}
          defaultState={{
            details,
            providerAccounts,
          }}
        ></PaymentSetupForm>
      </div>
    </NextIntlClientProvider>
  );
}
