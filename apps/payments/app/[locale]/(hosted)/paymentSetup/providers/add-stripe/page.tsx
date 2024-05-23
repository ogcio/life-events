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
    defaultState?: {
      providerName: string;
      livePublishableKey: string;
      liveSecretKey: string;
    };
  }> {
    "use server";
    const nameField = formData.get("provider_name") as string;
    const livePublishableKeyField = formData.get(
      "live_publishable_key",
    ) as string;
    const liveSecretKeyField = formData.get("live_secret_key") as string;

    const formResult = {
      errors: {},
      defaultState: {
        providerName: nameField,
        livePublishableKey: livePublishableKeyField,
        liveSecretKey: liveSecretKeyField,
      },
    };

    const { data: result, error } = await new Payments(userId).createProvider({
      name: nameField,
      type: "stripe",
      data: {
        liveSecretKey: liveSecretKeyField,
        livePublishableKey: livePublishableKeyField,
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
      <StripeForm action={handleSubmit} />
    </NextIntlClientProvider>
  );
};
