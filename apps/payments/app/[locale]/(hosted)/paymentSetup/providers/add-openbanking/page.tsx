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
      const res = await new Payments(userId).createOpenBankingProvider({
        name: formData.get("provider_name") as string,
        type: "openbanking",
        data: {
          iban: (formData.get("iban") as string).replaceAll(" ", ""),
          accountHolderName: formData.get("account_holder_name") as string,
        },
      });
      console.log("TTTTTTTTTT");
      console.log("userid", userId);
      console.log(JSON.stringify(res));
    } catch (err) {
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
