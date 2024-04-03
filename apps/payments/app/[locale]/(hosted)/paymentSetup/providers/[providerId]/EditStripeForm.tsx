import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { StripeProvider, StripeData } from "../types";
import { getTranslations } from "next-intl/server";
import StripeFields from "../add-stripe/StripeFields";
import { PgSessions } from "auth/sessions";
import buildApiClient from "../../../../../../client/index";

type Props = {
  provider: StripeProvider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddStripe");

  async function updateProvider(formData: FormData) {
    "use server";

    const { userId } = await PgSessions.get();

    const providerName = formData.get("provider_name") as string;
    const livePublishableKey = formData.get("live_publishable_key");
    const liveSecretKey = formData.get("live_secret_key");
    const providerData = {
      livePublishableKey,
      liveSecretKey,
    };

    await buildApiClient(userId).providers.apiV1ProvidersProviderIdPut(
      provider.id,
      {
        name: providerName,
        data: providerData,
        status: provider.status,
      },
    );

    redirect("./");
  }

  return (
    <EditProviderForm provider={provider} updateProviderAction={updateProvider}>
      <h1 className="govie-heading-l">{t("editTitle")}</h1>
      <StripeFields
        providerName={provider.name}
        livePublishableKey={(provider.data as StripeData).livePublishableKey}
        liveSecretKey={(provider.data as StripeData).liveSecretKey}
      />
    </EditProviderForm>
  );
};
