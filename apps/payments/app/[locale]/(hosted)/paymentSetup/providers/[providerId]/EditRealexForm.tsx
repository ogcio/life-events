import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { RealexProvider } from "../types";
import { getTranslations } from "next-intl/server";
import RealexFields from "../add-realex/RealexFields";
import { Payments } from "building-blocks-sdk";
import getRequestConfig from "../../../../../../i18n";
import { errorHandler } from "../../../../../utils";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { realexValidationMap } from "../../../../../validationMaps";
import { RealexFormState } from "../add-realex/page";

type Props = {
  provider: RealexProvider;
  accessToken: string;
  locale: string;
};

export default async ({ provider, accessToken, locale }: Props) => {
  const t = await getTranslations("PaymentSetup.AddRealex");
  const { messages } = await getRequestConfig({ locale });

  const errorFieldMapping = realexValidationMap(t);

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<RealexFormState> {
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
            merchantId: merchantIdField,
            sharedSecret: sharedSecretField,
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
