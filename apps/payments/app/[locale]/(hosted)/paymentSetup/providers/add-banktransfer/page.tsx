import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import buildApiClient from "../../../../../../client/index";
import BankTransferFields from "./BankTransferFields";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";

    await buildApiClient(userId).providers.apiV1ProvidersPost({
      name: formData.get("provider_name") as string,
      type: "banktransfer",
      providerData: {
        sortCode: formData.get("sort_code") as string,
        accountNumber: formData.get("account_number") as string,
        accountHolderName: formData.get("account_holder_name") as string,
      },
    });

    redirect("./");
  }

  return (
    <form action={handleSubmit}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <BankTransferFields />
      <button
        id="button"
        type="submit"
        data-module="govie-button"
        className="govie-button"
      >
        {t("confirm")}
      </button>
    </form>
  );
};
