import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";
import PaymentSetupFormPage, { ProvidersMap } from "../PaymentSetupFormPage";
import {
  errorHandler,
  getValidationErrors,
  stringToAmount,
} from "../../../../utils";
import { Payments } from "building-blocks-sdk";
import { PaymentRequestStatus } from "../../../../../types/common";
import { PaymentRequestDetails } from "../db";
import { ProviderType } from "../providers/types";
import { paymentRequestValidationMap } from "../../../../validationMaps";
import { getTranslations } from "next-intl/server";

type Props = {
  params: {
    locale: string;
  };
};

export default async function Page({ params: { locale } }: Props) {
  const t = await getTranslations("PaymentSetup.CreatePayment.form");
  const { userId } = await PgSessions.get();

  const validationMap = paymentRequestValidationMap(t);

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<{
    errors: {
      [key: string]: string;
    };
    defaultState: {
      details?: Partial<PaymentRequestDetails>;
      providerAccounts: ProvidersMap;
    };
  }> {
    "use server";
    const providerAccountsField = formData.get("providerAccounts") as string;

    const titleField = formData.get("title") as string;
    const descriptionField = formData.get("description") as string;
    const referenceField = formData.get("reference") as string;
    const amountField = stringToAmount(
      formData.get("amount")?.toString() as string,
    );
    const allowAmountOverrideField =
      formData.get("allowAmountOverride") === "on";
    const allowCustomAmountField = formData.get("allowCustomAmount") === "on";
    const redirectUrlField = formData.get("redirect-url") as string;
    const statusField = formData.get("status") as PaymentRequestStatus;

    const openBankingAccount = formData.get("openbanking-account")?.toString();
    const bankTransferAccount = formData
      .get("banktransfer-account")
      ?.toString();
    const cardAccount = formData.get("card-account")?.toString();

    const providerDetails: {
      id: string;
      name: string;
      type: ProviderType;
    }[] = [];

    const formResult = {
      errors: {},
      defaultState: {
        details: {
          title: titleField,
          description: descriptionField,
          reference: referenceField,
          amount: amountField,
          allowAmountOverride: allowAmountOverrideField,
          allowCustomAmount: allowCustomAmountField,
          redirectUrl: redirectUrlField,
          status: statusField,
          providers: providerDetails,
        },
        providerAccounts: JSON.parse(providerAccountsField),
      },
    };

    if (providerAccountsField) {
      formResult.defaultState.providerAccounts = JSON.parse(
        providerAccountsField,
      );
    }

    if (openBankingAccount) {
      const provider = formResult.defaultState.providerAccounts[
        "openbanking"
      ].find((provider) => provider.id === openBankingAccount);
      providerDetails.push(provider);
    }

    if (bankTransferAccount) {
      const provider = formResult.defaultState.providerAccounts[
        "banktransfer"
      ].find((provider) => provider.id === bankTransferAccount);
      providerDetails.push(provider);
    }

    if (cardAccount) {
      const provider = formResult.defaultState.providerAccounts["card"].find(
        (provider) => provider.id === cardAccount,
      );
      providerDetails.push(provider);
    }

    const providers: string[] = [
      openBankingAccount,
      bankTransferAccount,
      cardAccount,
    ].filter((provider): provider is string => !!provider);

    const { data: paymentRequest, error } = await new Payments(
      userId,
    ).createPaymentRequest({
      title: titleField,
      description: descriptionField,
      reference: referenceField,
      amount: amountField,
      redirectUrl: redirectUrlField,
      allowAmountOverride: allowAmountOverrideField,
      allowCustomAmount: allowCustomAmountField,
      status: statusField,
      providers,
    });

    if (error) {
      errorHandler(error);
    }

    if (!error?.validation && paymentRequest?.id) {
      redirect(`./requests/${paymentRequest?.id}`, RedirectType.replace);
    }

    if (error?.validation) {
      formResult.errors = getValidationErrors(error.validation, validationMap);
    }

    return formResult;
  }

  return (
    <PaymentSetupFormPage
      userId={userId}
      locale={locale}
      action={handleSubmit}
    />
  );
}
