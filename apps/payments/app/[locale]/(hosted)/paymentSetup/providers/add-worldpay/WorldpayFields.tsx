import { getTranslations } from "next-intl/server";

type Props = {
  providerName?: string;
  merchantCode?: string;
  installationId?: string;
};

export default async ({
  providerName = "",
  merchantCode = "",
  installationId = "",
}: Props) => {
  const t = await getTranslations("PaymentSetup.AddWorldpay");

  return (
    <div className="govie-form-group ">
      <div className="govie-form-group">
        <label className="govie-label--s" htmlFor="provider_name">
          {t("name")}
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
        <label className="govie-label--s" htmlFor="merchant_code">
          {t("merchantCode")}
        </label>
        <div className="govie-hint">{t("merchantCodeHint")}</div>
        <input
          type="text"
          id="merchant_code"
          name="merchant_code"
          className="govie-input"
          defaultValue={merchantCode}
        />
      </div>
      <div className="govie-form-group">
        <label className="govie-label--s" htmlFor="installation_id">
          {t("installationId")}
        </label>
        <div className="govie-hint">{t("installationIdHint")}</div>
        <input
          type="text"
          id="installation_id"
          name="installation_id"
          className="govie-input"
          defaultValue={installationId}
        />
      </div>
    </div>
  );
};
