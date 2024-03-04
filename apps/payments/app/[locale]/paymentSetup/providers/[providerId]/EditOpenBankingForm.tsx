import { pgpool } from "../../../../dbConnection";
import { redirect } from "next/navigation";
import OpenBankingFields from "../add-openbanking/OpenBankingFields";
import EditProviderForm from "./EditProviderForm";
import type { Provider } from "../types";
import { getTranslations } from "next-intl/server";

type Props = {
  provider: Provider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");

  async function updateProvider(formData: FormData) {
    "use server";
    const providerName = formData.get("provider_name");

    const sortCode = formData.get("sort_code");
    const accountNumber = formData.get("account_number");
    const accountHolderName = formData.get("account_holder_name");
    const providerData = {
      sortCode,
      accountNumber,
      accountHolderName,
    };

    await pgpool.query(
      `
      UPDATE payment_providers SET provider_name = $1,
        provider_data = $2
      WHERE provider_id = $3
    `,
      [providerName, providerData, provider.id]
    );

    redirect("./");
  }

  return (
    <EditProviderForm provider={provider} updateProviderAction={updateProvider}>
      <h1 className="govie-heading-l">{t("editTitle")}</h1>
      <OpenBankingFields
        providerName={provider.name}
        accountHolderName={provider.providerData.accountHolderName}
        sortCode={provider.providerData.sortCode}
        accountNumber={provider.providerData.accountNumber}
      />
    </EditProviderForm>
  );
};
