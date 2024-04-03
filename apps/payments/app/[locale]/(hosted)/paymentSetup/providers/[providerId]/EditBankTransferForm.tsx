import { redirect } from "next/navigation";
import BankTransferFields from "../add-banktransfer/BankTransferFields";
import EditProviderForm from "./EditProviderForm";
import type { BankTransferProvider } from "../types";
import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import buildApiClient from "../../../../../../client/index";

type Props = {
  provider: BankTransferProvider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");

  async function updateProvider(formData: FormData) {
    "use server";

    const { userId } = await PgSessions.get();

    const providerName = formData.get("provider_name");
    const sortCode = formData.get("sort_code");
    const accountNumber = formData.get("account_number");
    const accountHolderName = formData.get("account_holder_name");
    const providerData = {
      sortCode,
      accountNumber,
      accountHolderName,
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
      <BankTransferFields
        providerName={provider.name}
        accountHolderName={provider.data.accountHolderName}
        sortCode={provider.data.sortCode}
        accountNumber={provider.data.accountNumber}
      />
    </EditProviderForm>
  );
};
