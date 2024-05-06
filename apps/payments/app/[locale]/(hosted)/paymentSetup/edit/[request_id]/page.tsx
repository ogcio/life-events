import { PgSessions } from "auth/sessions";
import { notFound, redirect } from "next/navigation";
import PaymentSetupForm from "../../PaymentSetupForm";
import { stringToAmount } from "../../../../../utils";
import { ApiV1RequestsGet200ResponseInnerProvidersInner } from "../../../../../../client/autogenerated";
import { providerTypes } from "../../providers/types";
import { Payments } from "building-blocks-sdk";

async function editPayment(
  userId: string,
  paymentRequestId: string,
  currentProviders: ApiV1RequestsGet200ResponseInnerProvidersInner[],
  formData: FormData,
) {
  "use server";

  const providersUpdate = providerTypes.reduce(
    (acc, type) => {
      const currentId = currentProviders.find(
        (provider) => provider.type === type,
      )?.id;
      const newId = formData.get(`${type}-account`)?.toString();

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
    paymentRequestId,
    providersUpdate,
  };

  const requestId = (await new Payments(userId).updatePaymentRequest(data)).data
    ?.id;

  redirect(`/paymentSetup/requests/${requestId}`);
}

export default async function (props: { params: { request_id: string } }) {
  const { userId } = await PgSessions.get();
  const details = (
    await new Payments(userId).getPaymentRequest(props.params.request_id)
  ).data;

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
