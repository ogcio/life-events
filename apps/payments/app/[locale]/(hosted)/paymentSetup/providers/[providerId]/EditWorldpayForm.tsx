import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { WorldpayData, WorldpayProvider } from "../types";
import { getTranslations } from "next-intl/server";
import WorldpayFields from "../add-worldpay/WorldpayFields";
import { PgSessions } from "auth/sessions";
import buildApiClient from "../../../../../../client/index";

type Props = {
  provider: WorldpayProvider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddWorldpay");

  async function updateProvider(formData: FormData) {
    "use server";

    const { userId } = await PgSessions.get();

    const providerName = formData.get("provider_name") as string;
    const merchantCode = formData.get("merchant_code");
    const installationId = formData.get("installation_id");
    const providerData = {
      merchantCode,
      installationId,
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
      <WorldpayFields
        providerName={provider.name}
        merchantCode={(provider.data as WorldpayData).merchantCode}
        installationId={(provider.data as WorldpayData).installationId}
      />
    </EditProviderForm>
  );
};
