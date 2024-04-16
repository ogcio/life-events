import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import StripeFields from "./StripeFields";
import { Payments } from "building-blocks-sdk";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddStripe");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";

    await new Payments(userId).createStripeProvider({
      name: formData.get("provider_name") as string,
      type: "stripe",
      data: {
        liveSecretKey: formData.get("live_secret_key") as string,
        livePublishableKey: formData.get("live_publishable_key") as string,
      },
    });

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
