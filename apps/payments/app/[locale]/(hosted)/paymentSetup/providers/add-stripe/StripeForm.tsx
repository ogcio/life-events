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
    livePublishableKey?: string;
    liveSecretKey?: string;
  };
}) => {
  const t = useTranslations("AddStripe");

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
          name="live_publishable_key"
          label={t("livePublishableKey")}
          hint={t("livePublishableKeyHint")}
          error={state.errors.livePublishableKey}
          defaultValue={state.defaultState?.livePublishableKey}
        />
        <InputField
          name="live_secret_key"
          label={t("liveSecretKey")}
          hint={t("liveSecretKeyHint")}
          error={state.errors.liveSecretKey}
          defaultValue={state.defaultState?.liveSecretKey}
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
