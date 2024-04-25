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
    providerName?: string;
    merchantId?: string;
    sharedSecret?: string;
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
      <div className="govie-form-group ">
        <InputField
          name="provider_name"
          label={t("name")}
          hint={t("nameHint")}
          error={state.errors.providerName}
          defaultValue={state.defaultState?.providerName}
        />
        <InputField
          name="merchant_id"
          label={t("merchantId")}
          hint={t("merchantIdHint")}
          error={state.errors.merchantId}
          defaultValue={state.defaultState?.merchantId}
        />
        <InputField
          name="shared_secret"
          label={t("sharedSecret")}
          hint={t("sharedSecretHint")}
          error={state.errors.sharedSecret}
          defaultValue={state.defaultState?.sharedSecret}
          autoComplete="off"
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
