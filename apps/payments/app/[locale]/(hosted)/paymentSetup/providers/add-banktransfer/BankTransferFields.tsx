import { getTranslations } from "next-intl/server";

type Props = {
  providerName?: string;
  accountHolderName?: string;
  iban?: string;
};

export default async ({
  providerName = "",
  accountHolderName = "",
  iban = "",
}: Props) => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");

  return (
    <div className="govie-form-group ">
      <div className="govie-form-group">
        <label className="govie-label--s" htmlFor="provider_name">
          {t("name")}{" "}
        </label>
        <div className="govie-hint">{t("nameHint")}</div>
        <input
          type="text"
          id="provider_name"
          name="provider_name"
          className="govie-input"
          defaultValue={providerName}
        />
      </div>
      <div className="govie-form-group">
        <label className="govie-label--s" htmlFor="account_holder_name">
          {t("accountHolderName")}{" "}
        </label>
        <div className="govie-hint">{t("accountHolderNameHint")}</div>
        <input
          type="text"
          id="account_holder_name"
          name="account_holder_name"
          className="govie-input"
          defaultValue={accountHolderName}
        />
      </div>
      <div className="govie-form-group">
        <label className="govie-label--s" htmlFor="iban">
          {t("iban")}{" "}
        </label>
        <div className="govie-hint">{t("ibanHint")}</div>
        <input
          type="text"
          id="iban"
          name="iban"
          className="govie-input"
          defaultValue={iban}
        />
      </div>
    </div>
  );
};
