import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("payments.AddProvider");

  async function handleSubmit(formData: FormData) {
    "use server";
    const provider_type = formData.get("provider_type");

    redirect(`add-${provider_type}`);
  }

  return (
    <form action={handleSubmit}>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <p className="govie-body">{t("description")}</p>
      <p className="govie-body">{t("openbankingDescription")}</p>
      <p className="govie-body">{t("stripeDescription")}</p>
      <p className="govie-body">{t("worldpayDescription")}</p>
      <div className="govie-form-group ">
        <legend className="govie-fieldset__legend govie-fieldset__legend--m">
          <h1 className="govie-fieldset__heading">{t("selectHint")}</h1>
        </legend>
        <div className="govie-form-group">
          <label className="govie-label--s" htmlFor="provider_type">
            {t("label")}
          </label>
          <select
            className="govie-select"
            id="provider_type"
            name="provider_type"
          >
            <option value="openbanking">{t("openbanking")}</option>
            <option value="stripe">{t("stripe")}</option>
            <option value="worldpay">{t("worldpay")}</option>
          </select>
        </div>
      </div>

      <button
        id="button"
        type="submit"
        data-module="govie-button"
        className="govie-button"
      >
        {t("continue")}
      </button>
    </form>
  );
};
