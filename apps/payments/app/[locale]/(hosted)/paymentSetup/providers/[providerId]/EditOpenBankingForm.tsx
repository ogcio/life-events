import { redirect } from "next/navigation";
import OpenBankingFields from "../add-openbanking/OpenBankingFields";
import EditProviderForm from "./EditProviderForm";
import type { OpenBankingProvider } from "../types";
import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { Payments } from "building-blocks-sdk";
import { errorHandler } from "../../../../../utils";

type Props = {
  provider: OpenBankingProvider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddOpenbanking");

  async function updateProvider(formData: FormData) {
    "use server";

    const { userId } = await PgSessions.get();

    const { error } = await new Payments(userId).updateProvider(provider.id, {
      name: formData.get("provider_name") as string,
      data: {
        iban: formData.get("iban") as string,
        accountHolderName: formData.get("account_holder_name") as string,
      },
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
      <OpenBankingFields
        providerName={provider.name}
        accountHolderName={provider.data.accountHolderName}
        iban={provider.data.iban}
      />
    </EditProviderForm>
  );
};
