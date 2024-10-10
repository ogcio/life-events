import { PaymentRequestDetails } from "./db";
import { errorHandler, providerTypeToPaymentMethod } from "../../../utils";
import PaymentSetupForm from "./PaymentSetupForm";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import getRequestConfig from "../../../../i18n";
import { ProviderType } from "./providers/types";
import { PaymentRequestFormState } from "./create/page";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";

export type ProvidersMap = Record<
  string,
  {
    id: string;
    name: string;
    type: ProviderType;
  }[]
>;

async function getRegisteredAccounts(): Promise<ProvidersMap> {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: providers, error } = await paymentsApi.getProviders();

  if (error) {
    errorHandler(error);
  }

  if (!providers) {
    return {};
  }

  const accounts = providers.reduce<ProvidersMap>((acc, provider) => {
    if (provider.status === "disconnected") return acc;

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
  originalState?: PaymentRequestDetails;
  locale: string;
  action: (
    prevState: FormData,
    formData: FormData,
  ) => Promise<PaymentRequestFormState>;
};

export default async function ({
  details,
  originalState,
  locale,
  action,
}: PaymentSetupFormPageProps) {
  const { messages } = await getRequestConfig({ locale });
  const providerAccounts = await getRegisteredAccounts();

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
          originalState={originalState}
        ></PaymentSetupForm>
      </div>
    </NextIntlClientProvider>
  );
}
