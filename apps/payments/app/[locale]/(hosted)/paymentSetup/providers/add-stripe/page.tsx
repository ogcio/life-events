import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { pgpool } from "../../../../../dbConnection";
import StripeFields from "./StripeFields";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddStripe");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";
    const providerName = formData.get("provider_name");
    const liveSecretKey = formData.get("live_secret_key");
    const livePublishableKey = formData.get("live_publishable_key");

    await pgpool.query(
      `
        INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
        VALUES ($1, $2, $3, $4, $5)
    `,
      [
        userId,
        providerName,
        "stripe",
        "connected",
        {
          // TODO: keys need to be encrypted
          liveSecretKey,
          livePublishableKey,
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
      <StripeFields />
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
