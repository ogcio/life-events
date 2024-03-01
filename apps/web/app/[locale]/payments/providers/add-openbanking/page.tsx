import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { pgpool } from "../../../../dbConnection";
import OpenBankingFields from "./OpenBankingFields";

export default async () => {
  const t = await getTranslations("payments.AddOpenbanking");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";
    const providerName = formData.get("provider_name");
    const sortCode = formData.get("sort_code");
    const accountNumber = formData.get("account_number");
    const accountHolderName = formData.get("account_holder_name");

    await pgpool.query(
      `
        INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
        VALUES ($1, $2, $3, $4, $5)
    `,
      [
        userId,
        providerName,
        "openbanking",
        "connected",
        {
          sortCode,
          accountNumber,
          accountHolderName,
        },
      ]
    );

    redirect("./");
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
