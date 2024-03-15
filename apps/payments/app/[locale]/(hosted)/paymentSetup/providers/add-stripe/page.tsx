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
          // TODO: use form inputs - currently using env vars for testing
          // keys need to be encrypted
          liveSecretKey: process.env.STRIPE_SECRET_KEY,
          livePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
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
