import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { Payments } from "building-blocks-sdk";
import getRequestConfig from "../../../../../../i18n";
import {
  errorHandler,
  getValidationErrors,
  ValidationErrorTypes,
} from "../../../../../utils";
import RealexForm from "./RealexForm";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("PaymentSetup.AddRealex");
  const { messages } = await getRequestConfig({ locale: props.params.locale });

  const { userId } = await PgSessions.get();

  const errorFieldMapping = {
    name: {
      field: "providerName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("nameRequired"),
      },
    },
    merchantId: {
      field: "merchantId",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("merchantIdRequired"),
      },
    },
    sharedSecret: {
      field: "sharedSecret",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("sharedSecretRequired"),
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
    defaultState: {
      providerName: string;
      merchantId: string;
      sharedSecret: string;
    };
  }> {
    "use server";
    const nameField = formData.get("provider_name") as string;
    const merchantIdField = formData.get("merchant_id") as string;
    const sharedSecretField = formData.get("shared_secret") as string;

    const formResult = {
      errors: {},
      defaultState: {
        providerName: nameField,
        merchantId: merchantIdField,
        sharedSecret: sharedSecretField,
      },
    };

    const { data: result, error } = await new Payments(userId).createProvider({
      name: nameField,
      type: "realex",
      data: {
        merchantId: merchantIdField,
        sharedSecret: sharedSecretField,
      },
    });

    if (error) {
      errorHandler(error);
    }

    if (result) redirect("./");

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
      <RealexForm action={handleSubmit} />
    </NextIntlClientProvider>
  );
};
