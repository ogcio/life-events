import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import BankTransferFields from "./BankTransferFields";
import { Payments } from "building-blocks-sdk";
import { ibanValidator } from "../../../../../utils";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");

  const { userId } = await PgSessions.get();

  async function validateForm(formData: FormData) {
    "use server";

    const errors = {};

    const provider_name = formData.get("provider_name") as string;
    if (!provider_name) {
      errors["provider_name"] = "Account name is required.";
    }

    const account_holder_name = formData.get("account_holder_name") as string;
    if (!account_holder_name) {
      errors["account_holder_name"] = "Account holder name is required.";
    }

    const iban = formData.get("iban") as string;
    if (!iban) {
      errors["iban"] = "IBAN is required.";
    } else if (!ibanValidator(iban.replaceAll(" ", ""))) {
      errors["iban"] = "Iban is not valid.";
    }

    return errors;
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const errors = await validateForm(formData);

    if (Object.entries(errors).length > 0) {
      return;
    }

    await new Payments(userId).createProvider({
      name: formData.get("provider_name") as string,
      type: "banktransfer",
      data: {
        iban: (formData.get("iban") as string).replaceAll(" ", ""),
        accountHolderName: formData.get("account_holder_name"),
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
