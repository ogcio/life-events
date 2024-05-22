"use client";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";
import OpenBankingFields from "./OpenBankingFields";

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
      <OpenBankingFields state={state}></OpenBankingFields>
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
