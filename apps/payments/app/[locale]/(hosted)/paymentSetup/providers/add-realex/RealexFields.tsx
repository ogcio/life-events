"use client";
import { useTranslations } from "next-intl";
import InputField from "../../../../../components/InputField";

type Props = {
  state: {
    errors: {
      [key: string]: string;
    };
    defaultState: {
      providerName?: string;
      merchantId?: string;
      sharedSecret?: string;
    };
  };
};

export default ({ state }: Props) => {
  const t = useTranslations("AddRealex");

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
  );
};
