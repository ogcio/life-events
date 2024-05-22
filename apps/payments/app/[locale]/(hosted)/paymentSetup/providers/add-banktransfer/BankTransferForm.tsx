"use client";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";
import BankTransferFields from "./BankTransferFields";

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
  const t = useTranslations("AddBankTransfer");

  const [state, serverAction] = useFormState(action, {
    defaultState,
    errors: {},
  });

  return (
    <form action={serverAction}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <BankTransferFields state={state}></BankTransferFields>
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
