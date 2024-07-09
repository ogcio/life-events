import { redirect } from "next/navigation";
import OpenBankingFields from "../add-openbanking/OpenBankingFields";
import EditProviderForm from "./EditProviderForm";
import type { OpenBankingProvider } from "../types";
import { getTranslations } from "next-intl/server";
import getRequestConfig from "../../../../../../i18n";
import { errorHandler } from "../../../../../utils";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { openBankingValidationMap } from "../../../../../validationMaps";
import { OpenBankingFormState } from "../add-openbanking/page";
import { PaymentsApiFactory } from "../../../../../../libraries/payments-api";

type Props = {
  provider: OpenBankingProvider;
  locale: string;
};

export default async ({ provider, locale }: Props) => {
  const t = await getTranslations("PaymentSetup.AddOpenbanking");
  const { messages } = await getRequestConfig({ locale });

  const errorFieldMapping = openBankingValidationMap(t);

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<OpenBankingFormState> {
    "use server";

    const paymentsApi = await PaymentsApiFactory.getInstance();

    const nameField = formData.get("provider_name") as string;
    const accountHolderNameField = formData.get(
      "account_holder_name",
    ) as string;
    const ibanField = (formData.get("iban") as string).replaceAll(" ", "");

    const formResult = {
      errors: {},
      defaultState: {
        providerName: nameField,
        accountHolderName: accountHolderNameField,
        iban: ibanField,
      },
    };

    const action = formData.get("action");
    let providerData;
    switch (action) {
      case "enable":
        providerData = {
          name: provider.name,
          data: provider.data,
          type: provider.type,
          status: "connected",
        };
        break;
      case "disable":
        providerData = {
          name: provider.name,
          data: provider.data,
          type: provider.type,
          status: "disconnected",
        };
        break;
      default:
        providerData = {
          name: nameField,
          data: {
            iban: ibanField,
            accountHolderName: accountHolderNameField,
          },
          type: provider.type,
          status: provider.status,
        };
    }

    const { data: result, error } = await paymentsApi.updateProvider(
      provider.id,
      providerData,
    );

    formResult.errors = errorHandler(error, errorFieldMapping) ?? {};

    if (result) {
      redirect("./");
    }

    return formResult;
  }

  return (
    <NextIntlClientProvider
      messages={messages?.["PaymentSetup"] as AbstractIntlMessages}
    >
      <EditProviderForm
        provider={provider}
        action={handleSubmit}
        formComponent={OpenBankingFields}
        defaultState={{
          providerName: provider.name,
          accountHolderName: provider.data.accountHolderName,
          iban: provider.data.iban,
        }}
      >
        <h1 className="govie-heading-l">{t("editTitle")}</h1>
      </EditProviderForm>
    </NextIntlClientProvider>
  );
};
