import { redirect } from "next/navigation";
import EditProviderForm from "./EditProviderForm";
import type { RealexProvider, RealexData } from "../types";
import { getTranslations } from "next-intl/server";
import RealexFields from "../add-realex/RealexFields";
import { PgSessions } from "auth/sessions";
import { Payments } from "building-blocks-sdk";
import { errorHandler } from "../../../../../utils";

type Props = {
  provider: RealexProvider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddRealex");

  async function updateProvider(formData: FormData) {
    "use server";

    const { userId } = await PgSessions.get();

    const providerName = formData.get("provider_name") as unknown as string;
    const merchantId = formData.get("merchant_id") as unknown as string;
    const sharedSecret = formData.get("shared_secret") as unknown as string;
    const providerData = {
      merchantId,
      sharedSecret,
    };

    const { error } = await new Payments(userId).updateProvider(provider.id, {
      name: providerName,
      data: providerData,
      type: provider.type,
      status: provider.status,
    });

    if (error) {
      errorHandler(error);
    }

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
