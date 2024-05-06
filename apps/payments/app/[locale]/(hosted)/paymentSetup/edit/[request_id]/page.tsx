import { PgSessions } from "auth/sessions";
import { notFound, redirect } from "next/navigation";
import PaymentSetupForm from "../../PaymentSetupForm";
import {
  paymentMethodToProviderType,
  paymentMethods,
  stringToAmount,
} from "../../../../../utils";
import buildApiClient from "../../../../../../client/index";
import { Payments } from "building-blocks-sdk";
import { ProviderWithUnknownData } from "../../../../../../types/common";

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
    status: formData.get("status") as string,
    paymentRequestId,
    providersUpdate,
  };

  const requestId = (
    await buildApiClient(userId).paymentRequests.apiV1RequestsPut(data)
  ).data.id;

  redirect(`/paymentSetup/requests/${requestId}`);
}

export default async function (props: { params: { request_id: string } }) {
  const { userId } = await PgSessions.get();
  let details;

  try {
    details = (
      await new Payments(userId).getPaymentRequest(props.params.request_id)
    ).data;
  } catch (err) {
    console.log(err);
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
    <PaymentSetupForm
      userId={userId}
      action={submitPayment}
      details={details}
    />
  );
}
