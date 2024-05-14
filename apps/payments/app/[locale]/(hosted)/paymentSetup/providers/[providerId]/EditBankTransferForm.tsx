import { redirect } from "next/navigation";
import BankTransferFields from "../add-banktransfer/BankTransferFields";
import EditProviderForm from "./EditProviderForm";
import type { BankTransferProvider } from "../types";
import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { Payments } from "building-blocks-sdk";

type Props = {
  provider: BankTransferProvider;
};

export default async ({ provider }: Props) => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");

  async function updateProvider(formData: FormData) {
    "use server";

    const { userId } = await PgSessions.get();

    const providerName = formData.get("provider_name") as string;
    const iban = formData.get("iban");
    const accountHolderName = formData.get("account_holder_name");
    const providerData = {
      iban,
      accountHolderName,
    };

    await new Payments(userId).updateProvider(provider.id, {
      name: providerName,
      data: providerData,
      status: provider.status,
    });

    redirect("./");
  }

  return (
    <EditProviderForm provider={provider} updateProviderAction={updateProvider}>
      <h1 className="govie-heading-l">{t("editTitle")}</h1>
      <BankTransferFields
        providerName={provider.name}
        accountHolderName={provider.data.accountHolderName}
        iban={provider.data.iban}
      />
    </EditProviderForm>
  );
};
