import { notFound, redirect } from "next/navigation";
import PaymentSetupFormPage from "../../PaymentSetupFormPage";
import {
  errorHandler,
  paymentMethodToProviderType,
  paymentMethods,
  stringToAmount,
} from "../../../../../utils";
import { PaymentRequestStatus } from "../../../../../../types/common";
import { getTranslations } from "next-intl/server";
import { paymentRequestValidationMap } from "../../../../../validationMaps";
import { ProviderType } from "../../providers/types";
import { PaymentRequestFormState } from "../../create/page";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";

type Props = {
  params: {
    request_id: string;
    locale: string;
  };
};

export default async function ({ params: { request_id, locale } }: Props) {
  const t = await getTranslations("PaymentSetup.CreatePayment.form");
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: details, error } =
    await paymentsApi.getPaymentRequest(request_id);

  const validationMap = paymentRequestValidationMap(t);

  if (error) {
    errorHandler(error);
  }

  if (!details) {
    notFound();
  }

  async function handleSubmit(
    details: any,
    prevState: FormData,
    formData: FormData,
  ): Promise<PaymentRequestFormState> {
    "use server";

    const paymentsApi = await AuthenticationFactory.getPaymentsClient();

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

    const providersUpdate: {
      toDisable: string[];
      toCreate: string[];
    } = {
      toDisable: [],
      toCreate: [],
    };

    const providers: string[] = [];
    paymentMethods.forEach((paymentMethod) => {
      const selectedAccount = formData
        .get(`${paymentMethod}-account`)
        ?.toString();

      if (selectedAccount) {
        providers.push(selectedAccount);
      }

      if (!!selectedAccount) {
        const providerData = formResult.defaultState.providerAccounts[
          paymentMethod
        ].find((provider) => provider.id === selectedAccount);
        providerDetails.push(providerData);
      }

      const types = paymentMethodToProviderType[paymentMethod];
      const currentId = details.providers?.find((p) =>
        types.includes(p.type),
      )?.id;

      // If I deleted the provider, disable it
      if (currentId && !selectedAccount) {
        providersUpdate.toDisable.push(currentId);
        return;
      }

      //If I selected a provider (manual, stripe, openbanking) and before there was nothing, create it
      if (selectedAccount && !currentId) {
        providersUpdate.toCreate.push(selectedAccount as string);
        return;
      }

      // If I changed the provider, update it
      if (currentId && selectedAccount && currentId !== selectedAccount) {
        providersUpdate.toDisable.push(currentId);
        providersUpdate.toCreate.push(selectedAccount as string);
        return;
      }
    });

    const data = {
      title: titleField,
      description: descriptionField,
      reference: referenceField,
      amount: amountField,
      redirectUrl: redirectUrlField,
      allowAmountOverride: allowAmountOverrideField,
      allowCustomAmount: allowCustomAmountField,
      status: statusField,
      paymentRequestId: details!.paymentRequestId,
      providersUpdate,
      providers,
    };

    const { data: updateRes, error } =
      await paymentsApi.updatePaymentRequest(data);

    formResult.errors = errorHandler(error, validationMap) ?? {};

    if (!error?.validation && updateRes?.id) {
      redirect(`/paymentSetup/requests/${updateRes.id}`);
    }

    return formResult;
  }

  const handleSubmitClb = handleSubmit.bind(this, details);

  return (
    <PaymentSetupFormPage
      locale={locale}
      action={handleSubmitClb}
      details={details}
    />
  );
}
