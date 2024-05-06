import { notFound, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
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

type Props = {
  params: {
    providerId: string;
    locale: string;
  };
};

export default async ({ params: { providerId, locale } }: Props) => {
  const { userId } = await PgSessions.get();
  const provider = (await new Payments(userId).getProviderById(providerId))
    .data;

  if (!provider) {
    notFound();
  }

  if (provider.type === "openbanking") {
    return <EditOpenBankingForm provider={provider as OpenBankingProvider} />;
  }

  if (provider.type === "banktransfer") {
    return <EditBankTransferForm provider={provider as BankTransferProvider} />;
  }

  if (provider.type === "stripe") {
    return <EditStripeForm provider={provider as StripeProvider} />;
  }

  if (provider.type === "worldpay") {
    return <EditWorldpayForm provider={provider as WorldpayProvider} />;
  }

  if (provider.type === "realex") {
    return <EditRealexForm provider={provider as RealexProvider} />;
  }

  redirect("/paymentsetup/providers");
};
