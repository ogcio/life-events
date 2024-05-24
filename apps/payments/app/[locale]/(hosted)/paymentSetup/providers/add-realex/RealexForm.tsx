"use client";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";
import RealexFields from "./RealexFields";
import { RealexFormState } from "./page";

export default ({
  action,
  defaultState,
}: {
  action: (prevState: FormData, formData: FormData) => Promise<RealexFormState>;
  defaultState?: {
    providerName: string;
    merchantId: string;
    sharedSecret: string;
  };
}) => {
  const t = useTranslations("AddRealex");

  const [state, serverAction] = useFormState(action, {
    defaultState,
    errors: {},
  });

  return (
    <form action={serverAction}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <RealexFields state={state}></RealexFields>
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
