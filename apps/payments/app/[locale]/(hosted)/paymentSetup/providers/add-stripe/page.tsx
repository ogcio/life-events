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
import StripeForm from "./StripeForm";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("PaymentSetup.AddStripe");
  const { messages } = await getRequestConfig({ locale: props.params.locale });

  const { userId } = await PgSessions.get();

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

    const { data: result, error } = await new Payments(userId).createProvider({
      name: formData.get("provider_name") as string,
      type: "stripe",
      data: {
        liveSecretKey: formData.get("live_secret_key") as string,
        livePublishableKey: formData.get("live_publishable_key") as string,
      },
    });

    if (error) {
      errorHandler(error);
    }

    if (result) {
      redirect("./");
    }

    if (error.validation) {
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
      <StripeForm action={handleSubmit} />
    </NextIntlClientProvider>
  );
};
