import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { StripeProvider } from "../types";
import { getTranslations } from "next-intl/server";
import StripeFields from "../add-stripe/StripeFields";
import { Payments } from "building-blocks-sdk";
import getRequestConfig from "../../../../../../i18n";
import {
  errorHandler,
  getValidationErrors,
  ValidationErrorTypes,
} from "../../../../../utils";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

type Props = {
  provider: StripeProvider;
  userId: string;
  locale: string;
};

export default async ({ provider, userId, locale }: Props) => {
  const t = await getTranslations("PaymentSetup.AddStripe");
  const { messages } = await getRequestConfig({ locale });

  const errorFieldMapping = {
    name: {
      field: "providerName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("nameRequired"),
      },
    },
    liveSecretKey: {
      field: "liveSecretKey",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("liveSecretKeyRequired"),
      },
    },
    livePublishableKey: {
      field: "livePublishableKey",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("livePublishableKeyRequired"),
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
            livePublishableKey: formData.get("live_publishable_key") as string,
            liveSecretKey: formData.get("live_secret_key") as string,
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
        formComponent={StripeFields}
        defaultState={{
          providerName: provider.name,
          livePublishableKey: provider.data.livePublishableKey,
          liveSecretKey: provider.data.liveSecretKey,
        }}
      >
        <h1 className="govie-heading-l">{t("editTitle")}</h1>
      </EditProviderForm>
    </NextIntlClientProvider>
  );
};
