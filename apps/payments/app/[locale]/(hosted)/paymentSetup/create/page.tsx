import { RedirectType, redirect } from "next/navigation";
import PaymentSetupFormPage, { ProvidersMap } from "../PaymentSetupFormPage";
import {
  errorHandler,
  paymentMethods,
  stringToAmount,
} from "../../../../utils";
import { PaymentRequestStatus } from "../../../../../types/common";
import { PaymentRequestDetails } from "../db";
import { ProviderType } from "../providers/types";
import { paymentRequestValidationMap } from "../../../../validationMaps";
import { getTranslations } from "next-intl/server";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../PageWrapper";

type Props = {
  params: {
    locale: string;
  };
};

export type PaymentRequestFormState = {
  errors: {
    [key: string]: string;
  };
  defaultState: {
    details?: Partial<PaymentRequestDetails>;
    providerAccounts: ProvidersMap;
  };
};

export default async function Page({ params: { locale } }: Props) {
  const t = await getTranslations("PaymentSetup.CreatePayment.form");
  const validationMap = paymentRequestValidationMap(t);

  async function handleSubmit(
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

    const providers: string[] = [];

    paymentMethods.forEach((paymentMethod) => {
      const selectedAccount = formData
        .get(`${paymentMethod}-account`)
        ?.toString();

      if (!!selectedAccount) {
        const providerData = formResult.defaultState.providerAccounts[
          paymentMethod
        ].find((provider) => provider.id === selectedAccount);
        providerDetails.push(providerData);

        providers.push(selectedAccount);
      }
    });

    const { data: paymentRequest, error } =
      await paymentsApi.createPaymentRequest({
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

    formResult.errors = errorHandler(error, validationMap) ?? {};

    if (!error?.validation && paymentRequest?.id) {
      redirect(`./requests/${paymentRequest?.id}`, RedirectType.replace);
    }

    return formResult;
  }

  return (
    <PageWrapper locale={locale} disableOrgSelector={true}>
      <PaymentSetupFormPage locale={locale} action={handleSubmit} />
    </PageWrapper>
  );
}
