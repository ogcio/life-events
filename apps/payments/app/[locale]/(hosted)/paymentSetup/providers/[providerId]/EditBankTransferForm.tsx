import { redirect } from "next/navigation";
import BankTransferFields from "../add-banktransfer/BankTransferFields";
import EditProviderForm from "./EditProviderForm";
import type { BankTransferProvider } from "../types";
import { getTranslations } from "next-intl/server";
import { Payments } from "building-blocks-sdk";
import { errorHandler } from "../../../../../utils";
import getRequestConfig from "../../../../../../i18n";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { bankTransferValidationMap } from "../../../../../validationMaps";
import { BankTransferFormState } from "../add-banktransfer/page";

type Props = {
  provider: BankTransferProvider;
  userId: string;
  locale: string;
};

export default async ({ provider, userId, locale }: Props) => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");
  const { messages } = await getRequestConfig({ locale });

  const errorFieldMapping = bankTransferValidationMap(t);

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<BankTransferFormState> {
    "use server";
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

    const { data: result, error } = await new Payments(userId).updateProvider(
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
        formComponent={BankTransferFields}
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
