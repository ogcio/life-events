import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Payments } from "building-blocks-sdk";
import WorldpayFields from "./WorldpayFields";
import { errorHandler } from "../../../../../utils";
import { getPaymentsPublicServantContext } from "../../../../../../libraries/auth";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddWorldpay");

  const { accessToken } = await getPaymentsPublicServantContext();

  if (!accessToken) {
    return notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";

    if (!accessToken) {
      return notFound();
    }

    const { error } = await new Payments(accessToken).createProvider({
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
