import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import OpenBankingFields from "./OpenBankingFields";
import { Payments } from "building-blocks-sdk";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddOpenbanking");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";

    try {
      const res = await new Payments(userId).createProvider({
        name: formData.get("provider_name") as string,
        type: "openbanking",
        data: {
          iban: formData.get("iban"),
          accountNumber: formData.get("account_number"),
          accountHolderName: formData.get("account_holder_name"),
        },
      });
      console.log(res);
    } catch (err) {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>");
      console.log(err);
    }

    // redirect("./");
  }

  return (
    <form action={handleSubmit}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <OpenBankingFields />
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
