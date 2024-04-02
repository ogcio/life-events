import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import buildApiClient from "../../../../../../client/index";
import StripeFields from "./StripeFields";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddStripe");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";

    await buildApiClient(userId).providers.apiV1ProvidersPost({
      name: formData.get("provider_name") as string,
      type: "stripe",
      providerData: {
        liveSecretKey: formData.get("live_secret_key"),
        livePublishableKey: formData.get("live_publishable_key"),
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
