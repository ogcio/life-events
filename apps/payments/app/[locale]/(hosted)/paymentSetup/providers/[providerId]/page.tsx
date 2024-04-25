import { notFound, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import EditOpenBankingForm from "./EditOpenBankingForm";
import EditBankTransferForm from "./EditBankTransferForm";
import EditStripeForm from "./EditStripeForm";
import EditWorldpayForm from "./EditWorldpayForm";
import buildApiClient from "../../../../../../client/index";
import EditRealexForm from "./EditRealexForm";

type Props = {
  params: {
    providerId: string;
    locale: string;
  };
};

export default async ({ params: { providerId, locale } }: Props) => {
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

  if (provider.type === "realex") {
    return <EditRealexForm provider={provider} />;
  }

  redirect("/paymentsetup/providers");
};
