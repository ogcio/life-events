import { redirect } from "next/navigation";
import BankTransferFields from "../add-banktransfer/BankTransferFields";
import EditProviderForm from "./EditProviderForm";
import type { BankTransferProvider } from "../types";
import { getTranslations } from "next-intl/server";
import { Payments } from "building-blocks-sdk";
import {
  errorHandler,
  getValidationErrors,
  ValidationErrorTypes,
} from "../../../../../utils";
import getRequestConfig from "../../../../../../i18n";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

type Props = {
  provider: BankTransferProvider;
  userId: string;
  locale: string;
};

export default async ({ provider, userId, locale }: Props) => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");
  const { messages } = await getRequestConfig({ locale });

  const errorFieldMapping = {
    name: {
      field: "providerName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("nameRequired"),
      },
    },
    iban: {
      field: "iban",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("ibanRequired"),
        [ValidationErrorTypes.INVALID]: t("ibanInvalid"),
      },
    },
    accountHolderName: {
      field: "accountHolderName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("accountHolderNameRequired"),
      },
    },
  };

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<{
    errors: {
      [key: string]: string;
    };
  }> {
    "use server";
    const validation = {
      errors: {},
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
          name: formData.get("provider_name") as string,
          data: {
            iban: (formData.get("iban") as string).replaceAll(" ", ""),
            accountHolderName: formData.get("account_holder_name") as string,
          },
          type: provider.type,
          status: provider.status,
        };
    }

    const { data: result, error } = await new Payments(userId).updateProvider(
      provider.id,
      providerData,
    );

    if (error) {
      errorHandler(error);
    }

    if (result) {
      redirect("./");
    }

    if (error?.validation) {
      validation.errors = getValidationErrors(
        error.validation,
        errorFieldMapping,
      );
    }

    return validation;
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
