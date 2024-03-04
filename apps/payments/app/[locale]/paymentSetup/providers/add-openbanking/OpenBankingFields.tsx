import { getTranslations } from "next-intl/server";

type Props = {
  providerName?: string;
  accountHolderName?: string;
  sortCode?: string;
  accountNumber?: string;
};

export default async ({
  providerName = "",
  accountHolderName = "",
  sortCode = "",
  accountNumber = "",
}: Props) => {
  const t = await getTranslations("PaymentSetup.AddOpenbanking");

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
        <label className="govie-label--s" htmlFor="sort_code">
          {t("sortCode")}{" "}
        </label>
        <div className="govie-hint">{t("sortCodeHint")}</div>
        <input
          type="text"
          id="sort_code"
          name="sort_code"
          className="govie-input"
          defaultValue={sortCode}
        />
      </div>
      <div className="govie-form-group">
        <label className="govie-label--s" htmlFor="account_number">
          {t("accountNumber")}{" "}
        </label>
        <div className="govie-hint">{t("accountNumberHint")}</div>
        <input
          type="text"
          id="account_number"
          name="account_number"
          className="govie-input"
          defaultValue={accountNumber}
        />
      </div>
    </div>
  );
};
