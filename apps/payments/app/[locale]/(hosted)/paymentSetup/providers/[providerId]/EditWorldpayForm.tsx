import { pgpool } from "../../../../../dbConnection";
import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { WorldpayData, WorldpayProvider } from "../types";
import { getTranslations } from "next-intl/server";
import WorldpayFields from "../add-worldpay/WorldpayFields";

type Props = {
  provider: WorldpayProvider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddWorldpay");

  async function updateProvider(formData: FormData) {
    "use server";
    const providerName = formData.get("provider_name");
    const merchantCode = formData.get("merchant_code");
    const installationId = formData.get("installation_id");
    const providerData = {
      merchantCode,
      installationId,
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
      <WorldpayFields
        providerName={provider.name}
        merchantCode={(provider.providerData as WorldpayData).merchantCode}
        installationId={(provider.providerData as WorldpayData).installationId}
      />
    </EditProviderForm>
  );
};
