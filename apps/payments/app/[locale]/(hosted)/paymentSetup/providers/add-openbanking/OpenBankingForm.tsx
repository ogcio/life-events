"use client";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";
import InputField from "../../../../../components/InputField";

export default ({
  action,
  defaultState,
}: {
  action: (
    prevState: FormData,
    formData: FormData,
  ) => Promise<{
    errors: {
      [key: string]: string;
    };
  }>;
  defaultState?: {
    providerName: string;
    accountHolderName: string;
    iban: string;
  };
}) => {
  const t = useTranslations("AddOpenbanking");

  const [state, serverAction] = useFormState(action, {
    defaultState,
    errors: {},
  });

  return (
    <form action={serverAction}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <div className="govie-form-group ">
        <InputField
          name="provider_name"
          label={t("name")}
          hint={t("nameHint")}
          error={state.errors.providerName}
          defaultValue={state.defaultState?.providerName}
        />
        <InputField
          name="account_holder_name"
          label={t("accountHolderName")}
          hint={t("accountHolderNameHint")}
          error={state.errors.accountHolderName}
          defaultValue={state.defaultState?.accountHolderName}
        />
        <InputField
          name="iban"
          label={t("iban")}
          hint={t("ibanHint")}
          error={state.errors.iban}
          defaultValue={state.defaultState?.iban}
        />
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
