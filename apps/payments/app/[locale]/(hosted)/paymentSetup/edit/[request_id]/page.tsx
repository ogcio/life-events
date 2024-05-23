import { PgSessions } from "auth/sessions";
import { notFound, redirect } from "next/navigation";
import PaymentSetupFormPage from "../../PaymentSetupFormPage";
import { Payments } from "building-blocks-sdk";
import {
  errorHandler,
  paymentMethodToProviderType,
  paymentMethods,
  stringToAmount,
} from "../../../../../utils";
import {
  PaymentRequestStatus,
  ProviderWithUnknownData,
} from "../../../../../../types/common";
import { getTranslations } from "next-intl/server";
import { paymentRequestValidationMap } from "../../../../../validationMaps";

async function editPayment(
  userId: string,
  paymentRequestId: string,
  currentProviders: ProviderWithUnknownData[],
  formData: FormData,
) {
  "use server";

  const providersUpdate = paymentMethods.reduce(
    (acc, method) => {
      const types = paymentMethodToProviderType[method];
      const currentId = currentProviders.find((p) =>
        types.includes(p.type),
      )?.id;
      const newId = formData.get(`${method}-account`)?.toString();

      // If I deleted the provider, disable it
      if (currentId && !newId) {
        acc.toDisable.push(currentId);
        return acc;
      }

      //If I selected a provider (manual, stripe, openbanking) and before there was nothing, create it
      if (newId && !currentId) {
        acc.toCreate.push(newId as string);
        return acc;
      }

      // If I changed the provider, update it
      if (currentId && newId && currentId !== newId) {
        acc.toDisable.push(currentId);
        acc.toCreate.push(newId as string);
        return acc;
      }

      // Provider was not changed
      return acc;
    },
    {
      toDisable: [],
      toCreate: [],
    } as {
      toDisable: string[];
      toCreate: string[];
    },
  );

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    reference: formData.get("reference") as string,
    amount: stringToAmount(formData.get("amount") as string),
    redirectUrl: formData.get("redirect-url") as string,
    allowAmountOverride: formData.get("allowAmountOverride") === "on",
    allowCustomAmount: formData.get("allowCustomAmount") === "on",
    status: formData.get("status") as PaymentRequestStatus,
    paymentRequestId,
    providersUpdate,
  };

  const { data: updateRes, error } = await new Payments(
    userId,
  ).updatePaymentRequest(data);

  if (error) {
    errorHandler(error);
  }

  redirect(`/paymentSetup/requests/${updateRes?.id}`);
}

type Props = {
  params: {
    request_id: string;
    locale: string;
  };
};

export default async function ({ params: { request_id, locale } }: Props) {
  const { userId } = await PgSessions.get();
  const t = await getTranslations("PaymentSetup.CreatePayment.form");
  const { data: details, error } = await new Payments(userId).getPaymentRequest(
    request_id,
  );

  const validationMap = paymentRequestValidationMap(t);

  if (error) {
    errorHandler(error);
  }

  if (!details) {
    notFound();
  }

  const submitPayment = editPayment.bind(
    this,
    userId,
    details.paymentRequestId,
    details.providers,
  );

  return (
    <PaymentSetupFormPage
      userId={userId}
      locale={locale}
      action={submitPayment}
      details={details}
    />
  );
}
