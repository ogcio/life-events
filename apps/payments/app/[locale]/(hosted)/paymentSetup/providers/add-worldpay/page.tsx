import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { pgpool } from "../../../../../dbConnection";
import WorldpayFields from "./WorldpayFields";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddWorldpay");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";
    const providerName = formData.get("provider_name");
    const merchantCode = formData.get("merchant_code");
    const installationId = formData.get("installation_id");

    await pgpool.query(
      `
        INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
        VALUES ($1, $2, $3, $4, $5)
    `,
      [
        userId,
        providerName,
        "worldpay",
        "connected",
        {
          // TODO: codes need to be encrypted
          merchantCode,
          installationId,
        },
      ],
    );

    redirect("./");
  }

  return (
    <form action={handleSubmit}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <WorldpayFields />
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
