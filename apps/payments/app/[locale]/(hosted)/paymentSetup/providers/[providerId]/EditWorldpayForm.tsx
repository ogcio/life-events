import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { WorldpayData, WorldpayProvider } from "../types";
import { getTranslations } from "next-intl/server";
import WorldpayFields from "../add-worldpay/WorldpayFields";
import getRequestConfig from "../../../../../../i18n";
import {
  errorHandler,
  getValidationErrors,
  ValidationErrorTypes,
} from "../../../../../utils";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";

type Props = {
  provider: WorldpayProvider;
  locale: string;
};

export default async ({ provider, locale }: Props) => {
  const t = await getTranslations("PaymentSetup.AddWorldpay");
  const { messages } = await getRequestConfig({ locale });

  const errorFieldMapping = {};

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<{
    errors: {
      [key: string]: string;
    };
  }> {
    "use server";

    const paymentsApi = await AuthenticationFactory.getPaymentsClient();

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
            merchantCode: formData.get("merchant_code") as string,
            installationId: formData.get("installation_id") as string,
          },
          type: provider.type,
          status: provider.status,
        };
    }

    const { data: result, error } = await paymentsApi.updateProvider(
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

  return null;
  // (
  // <NextIntlClientProvider
  //   messages={messages?.["PaymentSetup"] as AbstractIntlMessages}
  // >
  //   <EditProviderForm
  //     provider={provider}
  //     action={handleSubmit}
  //     formComponent={WorldpayFields}
  //     defaultState={{
  //       providerName: provider.name,
  //       merchantCode: provider.data.merchantCode,
  //       installationId: provider.data.installationId
  //     }}
  //   >
  //     <h1 className="govie-heading-l">{t("editTitle")}</h1>
  //   </EditProviderForm>
  // </NextIntlClientProvider>
  // );
};
