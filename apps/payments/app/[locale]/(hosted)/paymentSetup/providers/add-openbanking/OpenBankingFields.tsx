"use client";
import { useTranslations } from "next-intl";
import InputField from "../../../../../components/InputField";
import { OpenBankingFormState } from "./page";

type Props = {
  state: OpenBankingFormState;
};

export default ({ state }: Props) => {
  const t = useTranslations("AddOpenbanking");

  return (
    <div className="govie-form-group">
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
  );
};
