import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { StripeProvider } from "../types";
import { getTranslations } from "next-intl/server";
import StripeFields from "../add-stripe/StripeFields";
import { Payments } from "building-blocks-sdk";
import getRequestConfig from "../../../../../../i18n";
import { errorHandler } from "../../../../../utils";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { stripeValidationMap } from "../../../../../validationMaps";
import { StripeFormState } from "../add-stripe/page";

type Props = {
  provider: StripeProvider;
  accessToken: string;
  locale: string;
};

export default async ({ provider, accessToken, locale }: Props) => {
  const t = await getTranslations("PaymentSetup.AddStripe");
  const { messages } = await getRequestConfig({ locale });

  const errorFieldMapping = stripeValidationMap(t);

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<StripeFormState> {
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
            livePublishableKey: livePublishableKeyField,
            liveSecretKey: liveSecretKeyField,
          },
          type: provider.type,
          status: provider.status,
        };
    }

    const { data: result, error } = await new Payments(
      accessToken,
    ).updateProvider(provider.id, providerData);

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
