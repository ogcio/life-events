import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { Payments } from "building-blocks-sdk";
import WorldpayFields from "./WorldpayFields";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddWorldpay");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";

    await new Payments(userId).createWorldpayProvider({
      name: formData.get("provider_name") as string,
      type: "worldpay",
      data: {
        merchantCode: formData.get("merchant_code") as string,
        installationId: formData.get("installation_id") as string,
      },
    });

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
