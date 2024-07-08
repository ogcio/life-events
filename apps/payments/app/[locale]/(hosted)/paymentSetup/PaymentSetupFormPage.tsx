import { PaymentRequestDetails } from "./db";
import { Payments } from "building-blocks-sdk";
import { errorHandler, providerTypeToPaymentMethod } from "../../../utils";
import PaymentSetupForm from "./PaymentSetupForm";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import getRequestConfig from "../../../../i18n";
import { ProviderType } from "./providers/types";
import { PaymentRequestFormState } from "./create/page";

export type ProvidersMap = Record<
  string,
  {
    id: string;
    name: string;
    type: ProviderType;
  }[]
>;

async function getRegisteredAccounts(
  accessToken: string,
): Promise<ProvidersMap> {
  const { data: providers, error } = await new Payments(
    accessToken,
  ).getProviders();

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
  accessToken: string;
  locale: string;
  action: (
    prevState: FormData,
    formData: FormData,
  ) => Promise<PaymentRequestFormState>;
};

export default async function ({
  details,
  accessToken,
  locale,
  action,
}: PaymentSetupFormPageProps) {
  const { messages } = await getRequestConfig({ locale });

  const providerAccounts = await getRegisteredAccounts(accessToken);

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
