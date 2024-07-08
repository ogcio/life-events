import { notFound, redirect } from "next/navigation";
import EditOpenBankingForm from "./EditOpenBankingForm";
import EditBankTransferForm from "./EditBankTransferForm";
import EditStripeForm from "./EditStripeForm";
import EditWorldpayForm from "./EditWorldpayForm";
import EditRealexForm from "./EditRealexForm";
import { Payments } from "building-blocks-sdk";
import {
  BankTransferProvider,
  OpenBankingProvider,
  RealexProvider,
  StripeProvider,
  WorldpayProvider,
} from "../types";
import { errorHandler } from "../../../../../utils";
import { getPaymentsPublicServantContext } from "../../../../../../libraries/auth";

type Props = {
  params: {
    providerId: string;
    locale: string;
  };
};

export default async ({ params: { providerId, locale } }: Props) => {
  const { accessToken } = await getPaymentsPublicServantContext();

  if (!accessToken) {
    return notFound();
  }

  const { data: provider, error } = await new Payments(
    accessToken,
  ).getProviderById(providerId);

  if (error) {
    errorHandler(error);
  }

  if (!provider) {
    notFound();
  }

  if (provider.type === "openbanking") {
    return (
      <EditOpenBankingForm
        provider={provider as OpenBankingProvider}
        accessToken={accessToken}
        locale={locale}
      />
    );
  }

  if (provider.type === "banktransfer") {
    return (
      <EditBankTransferForm
        provider={provider as BankTransferProvider}
        accessToken={accessToken}
        locale={locale}
      />
    );
  }

  if (provider.type === "stripe") {
    return (
      <EditStripeForm
        provider={provider as StripeProvider}
        accessToken={accessToken}
        locale={locale}
      />
    );
  }

  if (provider.type === "worldpay") {
    return (
      <EditWorldpayForm
        provider={provider as WorldpayProvider}
        accessToken={accessToken}
        locale={locale}
      />
    );
  }

  if (provider.type === "realex") {
    return (
      <EditRealexForm
        provider={provider as RealexProvider}
        accessToken={accessToken}
        locale={locale}
      />
    );
  }

  redirect("/paymentsetup/providers");
};
