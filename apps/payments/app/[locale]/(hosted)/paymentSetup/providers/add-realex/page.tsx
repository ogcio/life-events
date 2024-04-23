import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { Payments } from "building-blocks-sdk";
import RealexFields from "./RealexFields";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddRealex");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";

    await new Payments(userId).createRealexProvider({
      name: formData.get("provider_name") as string,
      type: "realex",
      data: {
        merchantId: formData.get("merchant_id") as string,
        sharedSecret: formData.get("shared_secret") as string,
      },
    });

    redirect("./");
  }

  return (
    <form action={handleSubmit}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <RealexFields />
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
