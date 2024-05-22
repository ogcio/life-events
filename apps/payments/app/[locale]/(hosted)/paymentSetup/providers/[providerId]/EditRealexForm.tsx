import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { RealexProvider } from "../types";
import { getTranslations } from "next-intl/server";
import RealexFields from "../add-realex/RealexFields";
import { Payments } from "building-blocks-sdk";
import getRequestConfig from "../../../../../../i18n";
import {
  errorHandler,
  getValidationErrors,
  ValidationErrorTypes,
} from "../../../../../utils";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

type Props = {
  provider: RealexProvider;
  userId: string;
  locale: string;
};

export default async ({ provider, userId, locale }: Props) => {
  const t = await getTranslations("PaymentSetup.AddRealex");
  const { messages } = await getRequestConfig({ locale });

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
            merchantId: formData.get("merchant_id") as unknown as string,
            sharedSecret: formData.get("shared_secret") as unknown as string,
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
        formComponent={RealexFields}
        defaultState={{
          providerName: provider.name,
          merchantId: provider.data.merchantId,
          sharedSecret: provider.data.sharedSecret,
        }}
      >
        <h1 className="govie-heading-l">{t("editTitle")}</h1>
      </EditProviderForm>
    </NextIntlClientProvider>
  );
};
