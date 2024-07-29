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
import PaymentsMenu from "../../PaymentsMenu";

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

  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();
  if (!isPublicServant) return notFound();

  const organizations = Object.values(await context.getOrganizations());
  const defaultOrgId = await context.getSelectedOrganization();
  let content;

  if (provider.type === "openbanking") {
    content = (
      <EditOpenBankingForm
        provider={provider as OpenBankingProvider}
        locale={locale}
      />
    );
  }

  if (provider.type === "banktransfer") {
    content = (
      <EditBankTransferForm
        provider={provider as BankTransferProvider}
        locale={locale}
      />
    );
  }

  if (provider.type === "stripe") {
    content = (
      <EditStripeForm provider={provider as StripeProvider} locale={locale} />
    );
  }

  if (provider.type === "worldpay") {
    content = (
      <EditWorldpayForm
        provider={provider as WorldpayProvider}
        locale={locale}
      />
    );
  }

  if (provider.type === "realex") {
    content = (
      <EditRealexForm provider={provider as RealexProvider} locale={locale} />
    );
  }

  if (content) {
    return (
      <div
        style={{
          display: "flex",
          marginTop: "1.3rem",
          gap: "2rem",
        }}
      >
        <PaymentsMenu
          locale={locale}
          organizations={organizations}
          defaultOrganization={defaultOrgId}
          disableOrgSelector={true}
        />
        <div>
          <section
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {content}
          </section>
        </div>
      </div>
    );
  }

  redirect("/paymentsetup/providers");
};
