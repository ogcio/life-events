import { notFound, redirect } from "next/navigation";
import EditOpenBankingForm from "./EditOpenBankingForm";
import EditBankTransferForm from "./EditBankTransferForm";
import EditStripeForm from "./EditStripeForm";
import EditWorldpayForm from "./EditWorldpayForm";
import EditRealexForm from "./EditRealexForm";
import {
  BankTransferProvider,
  OpenBankingProvider,
  RealexProvider,
  StripeProvider,
  WorldpayProvider,
} from "../types";
import { errorHandler } from "../../../../../utils";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";

type Props = {
  params: {
    providerId: string;
    locale: string;
  };
};

export default async ({ params: { providerId, locale } }: Props) => {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: provider, error } =
    await paymentsApi.getProviderById(providerId);

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
        locale={locale}
      />
    );
  }

  if (provider.type === "banktransfer") {
    return (
      <EditBankTransferForm
        provider={provider as BankTransferProvider}
        locale={locale}
      />
    );
  }

  if (provider.type === "stripe") {
    return (
      <EditStripeForm provider={provider as StripeProvider} locale={locale} />
    );
  }

  if (provider.type === "worldpay") {
    return (
      <EditWorldpayForm
        provider={provider as WorldpayProvider}
        locale={locale}
      />
    );
  }

  if (provider.type === "realex") {
    return (
      <EditRealexForm provider={provider as RealexProvider} locale={locale} />
    );
  }

  redirect("/paymentsetup/providers");
};
