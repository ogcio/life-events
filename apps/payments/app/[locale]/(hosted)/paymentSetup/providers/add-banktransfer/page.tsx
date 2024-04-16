import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import BankTransferFields from "./BankTransferFields";
import { Payments } from "building-blocks-sdk";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";

    await new Payments(userId).createBankTransferProvider({
      name: formData.get("provider_name") as string,
      type: "banktransfer",
      data: {
        iban: (formData.get("iban") as string).replaceAll(" ", ""),
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
