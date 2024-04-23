import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { RealexProvider, RealexData } from "../types";
import { getTranslations } from "next-intl/server";
import RealexFields from "../add-realex/RealexFields";
import { PgSessions } from "auth/sessions";
import buildApiClient from "../../../../../../client/index";

type Props = {
  provider: RealexProvider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddRealex");

  async function updateProvider(formData: FormData) {
    "use server";

    const { userId } = await PgSessions.get();

    const providerName = formData.get("provider_name") as string;
    const merchantId = formData.get("merchant_is");
    const sharedSecret = formData.get("shared_secret");
    const providerData = {
      merchantId,
      sharedSecret,
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
      <RealexFields
        providerName={provider.name}
        merchantId={(provider.data as RealexData).merchantId}
        sharedSecret={(provider.data as RealexData).sharedSecret}
      />
    </EditProviderForm>
  );
};
