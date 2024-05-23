import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { Payments } from "building-blocks-sdk";
import getRequestConfig from "../../../../../../i18n";
import {
  errorHandler,
  getValidationErrors,
  ValidationErrorTypes,
} from "../../../../../utils";
import OpenBankingForm from "./OpenBankingForm";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("PaymentSetup.AddOpenbanking");
  const { messages } = await getRequestConfig({ locale: props.params.locale });

  const { userId } = await PgSessions.get();

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
    defaultState?: {
      providerName: string;
      accountHolderName: string;
      iban: string;
    };
  }> {
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

    const { data: result, error } = await new Payments(userId).createProvider({
      name: nameField,
      type: "openbanking",
      data: {
        iban: ibanField,
        accountHolderName: accountHolderNameField,
      },
    });

    if (error) {
      errorHandler(error);
    }

    if (result) {
      redirect("./");
    }

    if (error.validation) {
      formResult.errors = getValidationErrors(
        error.validation,
        errorFieldMapping,
      );
    }

    return formResult;
  }

  return (
    <NextIntlClientProvider
      messages={messages?.["PaymentSetup"] as AbstractIntlMessages}
    >
      <OpenBankingForm action={handleSubmit} />
    </NextIntlClientProvider>
  );
};
