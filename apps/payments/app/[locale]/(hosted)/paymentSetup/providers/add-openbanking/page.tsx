import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { Payments } from "building-blocks-sdk";
import getRequestConfig from "../../../../../../i18n";
import { errorHandler } from "../../../../../utils";
import OpenBankingForm from "./OpenBankingForm";
import { openBankingValidationMap } from "../../../../../validationMaps";
import { getPaymentsPublicServantContext } from "../../../../../../libraries/auth";

type Props = {
  params: {
    locale: string;
  };
};

export type OpenBankingFormState = {
  errors: {
    [key: string]: string;
  };
  defaultState?: {
    providerName: string;
    accountHolderName: string;
    iban: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("PaymentSetup.AddOpenbanking");
  const { messages } = await getRequestConfig({ locale: props.params.locale });

  const { accessToken } = await getPaymentsPublicServantContext();

  if (!accessToken) {
    return notFound();
  }

  const errorFieldMapping = openBankingValidationMap(t);

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<OpenBankingFormState> {
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

    if (!accessToken) {
      return notFound();
    }

    const { data: result, error } = await new Payments(
      accessToken,
    ).createProvider({
      name: nameField,
      type: "openbanking",
      data: {
        iban: ibanField,
        accountHolderName: accountHolderNameField,
      },
    });

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
      <OpenBankingForm action={handleSubmit} />
    </NextIntlClientProvider>
  );
};
