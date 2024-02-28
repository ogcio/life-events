import { getTranslations } from "next-intl/server";
import { PgSessions, pgpool } from "../../../../sessions";
import { redirect } from "next/navigation";

export default async () => {
  const t = await getTranslations("payments.AddOpenbanking");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";
    const provider_name = formData.get("provider_name");
    const sort_code = formData.get("sort_code");
    const account_number = formData.get("account_number");
    const account_holder_name = formData.get("account_holder_name");

    await pgpool.query(
      `
        INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
        VALUES ($1, $2, $3, $4, $5)
    `,
      [userId, provider_name, "openbanking", "connected", { sort_code, account_number, account_holder_name }]
    );

    redirect(`./`);
  }

  return (
    <form action={handleSubmit}>

      <div className="govie-form-group ">
        <legend className="govie-fieldset__legend govie-fieldset__legend--m">
          <h1 className="govie-fieldset__heading">{t('title')}</h1>
        </legend>
        <div className="govie-form-group">
          <label className="govie-label--s" htmlFor="provider_name">{t('name')} </label>
          <div className="govie-hint">{t('nameHint')}</div>
          <input
            type="text"
            id="provider_name"
            name="provider_name"
            className="govie-input"
          />
        </div>
        <div className="govie-form-group">
          <label className="govie-label--s" htmlFor="account_holder_name">{t('accountHolderName')} </label>
          <input
            type="text"
            id="account_holder_name"
            name="account_holder_name"
            className="govie-input"
          />
        </div>
        <div className="govie-form-group">
          <label className="govie-label--s" htmlFor="sort_code">{t('sortCode')} </label>
          <input
            type="text"
            id="sort_code"
            name="sort_code"
            className="govie-input"
          />
        </div>
        <div className="govie-form-group">
          <label className="govie-label--s" htmlFor="account_number">{t('accountNumber')} </label>
          <input
            type="text"
            id="account_number"
            name="account_number"
            className="govie-input"
          />
        </div>
      </div>

      <button id="button" type="submit" data-module="govie-button" className="govie-button">{t('confirm')}</button>
    </form>
  )
}
