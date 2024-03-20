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
          // TODO: use form inputs - currently using env vars for testing
          merchantCode: process.env.WORLDPAY_MERCHANT_CODE,
          installationId: process.env.WORLDPAY_INSTALLATION_ID,
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
