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
import { PageWrapper } from "../../../PageWrapper";

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
      <PageWrapper locale={locale} disableOrgSelector={true}>
        <EditOpenBankingForm
          provider={provider as OpenBankingProvider}
          locale={locale}
        />
      </PageWrapper>
    );
  }

  if (provider.type === "banktransfer") {
    return (
      <PageWrapper locale={locale} disableOrgSelector={true}>
        <EditBankTransferForm
          provider={provider as BankTransferProvider}
          locale={locale}
        />
      </PageWrapper>
    );
  }

  if (provider.type === "stripe") {
    return (
      <PageWrapper locale={locale} disableOrgSelector={true}>
        <EditStripeForm provider={provider as StripeProvider} locale={locale} />
      </PageWrapper>
    );
  }

  if (provider.type === "worldpay") {
    return (
      <PageWrapper locale={locale} disableOrgSelector={true}>
        <EditWorldpayForm
          provider={provider as WorldpayProvider}
          locale={locale}
        />
      </PageWrapper>
    );
  }

  if (provider.type === "realex") {
    return (
      <PageWrapper locale={locale} disableOrgSelector={true}>
        <EditRealexForm provider={provider as RealexProvider} locale={locale} />
      </PageWrapper>
    );
  }

  redirect("/paymentsetup/providers");
};
