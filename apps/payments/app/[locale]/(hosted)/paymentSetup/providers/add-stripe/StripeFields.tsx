"use client";
import { useTranslations } from "next-intl";
import InputField from "../../../../../components/InputField";
import { StripeFormState } from "./page";

type Props = {
  state: StripeFormState;
};

export default ({ state }: Props) => {
  const t = useTranslations("AddStripe");

  return (
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
        autoComplete="off"
      />
    </div>
  );
};
