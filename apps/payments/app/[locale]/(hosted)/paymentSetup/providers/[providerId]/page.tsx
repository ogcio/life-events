import { notFound, redirect } from "next/navigation";
import EditOpenBankingForm from "./EditOpenBankingForm";
import EditBankTransferForm from "./EditBankTransferForm";
import EditStripeForm from "./EditStripeForm";
import EditWorldpayForm from "./EditWorldpayForm";
import buildApiClient from "../../../../../../client/index";
import { getUser } from "../../../../../../libraries/auth";

type Props = {
  params: {
    providerId: string;
    locale: string;
  };
};

export default async ({ params: { providerId, locale } }: Props) => {
  const user = await getUser();

  const provider = (
    await buildApiClient(
      user.accessToken,
    ).providers.apiV1ProvidersProviderIdGet(providerId)
  ).data;

  if (!provider) {
    notFound();
  }

  if (provider.type === "openbanking") {
    return <EditOpenBankingForm provider={provider} />;
  }

  if (provider.type === "banktransfer") {
    return <EditBankTransferForm provider={provider} locale={locale} />;
  }

  if (provider.type === "stripe") {
    return <EditStripeForm provider={provider} />;
  }

  if (provider.type === "worldpay") {
    return <EditWorldpayForm provider={provider} />;
  }

  redirect("/paymentsetup/providers");
};
