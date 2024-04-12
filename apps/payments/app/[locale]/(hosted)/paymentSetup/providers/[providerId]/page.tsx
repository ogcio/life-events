import { notFound, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import EditOpenBankingForm from "./EditOpenBankingForm";
import EditBankTransferForm from "./EditBankTransferForm";
import EditStripeForm from "./EditStripeForm";
import EditWorldpayForm from "./EditWorldpayForm";
import buildApiClient from "../../../../../../client/index";

type Props = {
  params: {
    providerId: string;
  };
};

export default async ({ params: { providerId } }: Props) => {
  const { userId } = await PgSessions.get();
  let provider;
  try {
    provider = (
      await buildApiClient(userId).providers.apiV1ProvidersProviderIdGet(
        providerId,
      )
    ).data;
  } catch (err) {
    console.error(err);
  }

  if (!provider) {
    notFound();
  }

  if (provider.type === "openbanking") {
    return <EditOpenBankingForm provider={provider} />;
  }

  if (provider.type === "banktransfer") {
    return <EditBankTransferForm provider={provider} />;
  }

  if (provider.type === "stripe") {
    return <EditStripeForm provider={provider} />;
  }

  if (provider.type === "worldpay") {
    return <EditWorldpayForm provider={provider} />;
  }

  redirect("/paymentsetup/providers");
};
