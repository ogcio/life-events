"use client";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";

export default ({
  action,
}: {
  action: (
    prevState: FormData,
    formData: FormData,
  ) => Promise<{
    errors: {
      [key: string]: string;
    };
  }>;
}) => {
  const t = useTranslations("AddBankTransfer");

  const [state, serverAction] = useFormState(action, {
    //TODO: Add initial state here from props to allow edit as well
    errors: {},
  });

  return (
    <form action={serverAction}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <div className="govie-form-group ">
        <div className="govie-form-group">
          <label className="govie-label--s" htmlFor="provider_name">
            {t("name")}
          </label>
          <div className="govie-hint">{t("nameHint")}</div>
          <input
            type="text"
            id="provider_name"
            name="provider_name"
            className="govie-input"
          />
        </div>
        <div className="govie-form-group">
          <label className="govie-label--s" htmlFor="account_holder_name">
            {t("accountHolderName")}
          </label>
          <div className="govie-hint">{t("accountHolderNameHint")}</div>
          <input
            type="text"
            id="account_holder_name"
            name="account_holder_name"
            className="govie-input"
          />
        </div>
        <div
          className={`govie-form-group ${state.errors.iban && "govie-form-group--error"}`}
        >
          <label className="govie-label--s" htmlFor="iban">
            {t("iban")}
          </label>
          <div className="govie-hint">{t("ibanHint")}</div>
          {
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {state.errors.iban}
            </p>
          }
          <input type="text" id="iban" name="iban" className="govie-input" />
        </div>
      </div>
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
