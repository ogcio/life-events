import { pgpool } from "../../../../../dbConnection";
import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { Provider, StripeData } from "../types";
import { getTranslations } from "next-intl/server";
import StripeFields from "../add-stripe/StripeFields";

type Props = {
  provider: Provider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddStripe");

  async function updateProvider(formData: FormData) {
    "use server";
    const providerName = formData.get("provider_name");

    const livePublishableKey = formData.get("live_publishable_key");
    const liveSecretKey = formData.get("live_secret_key");
    const providerData = {
      livePublishableKey,
      liveSecretKey,
    };

    await pgpool.query(
      `
      UPDATE payment_providers SET provider_name = $1,
        provider_data = $2
      WHERE provider_id = $3
    `,
      [providerName, providerData, provider.id],
    );

    redirect("./");
  }

  return (
    <EditProviderForm provider={provider} updateProviderAction={updateProvider}>
      <h1 className="govie-heading-l">{t("editTitle")}</h1>
      <StripeFields
        providerName={provider.name}
        livePublishableKey={
          (provider.providerData as StripeData).livePublishableKey
        }
        liveSecretKey={(provider.providerData as StripeData).liveSecretKey}
      />
    </EditProviderForm>
  );
};
