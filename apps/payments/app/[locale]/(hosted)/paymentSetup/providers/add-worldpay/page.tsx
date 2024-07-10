import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import WorldpayFields from "./WorldpayFields";
import { errorHandler } from "../../../../../utils";
import { PaymentsApiFactory } from "../../../../../../libraries/payments-api";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddWorldpay");

  async function handleSubmit(formData: FormData) {
    "use server";

    const paymentsApi = await PaymentsApiFactory.getInstance();
    const { error } = await paymentsApi.createProvider({
      name: formData.get("provider_name") as string,
      type: "worldpay",
      data: {
        merchantCode: formData.get("merchant_code") as string,
        installationId: formData.get("installation_id") as string,
      },
    });

    if (error) {
      errorHandler(error);
    }

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
