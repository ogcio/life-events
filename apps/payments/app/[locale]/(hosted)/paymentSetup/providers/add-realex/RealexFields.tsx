import { getTranslations } from "next-intl/server";

type Props = {
  providerName?: string;
  merchantId?: string;
  sharedSecret?: string;
};

export default async ({
  providerName = "",
  merchantId = "",
  sharedSecret = "",
}: Props) => {
  const t = await getTranslations("PaymentSetup.AddRealex");

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
        <label className="govie-label--s" htmlFor="merchant_id">
          {t("merchantId")}
        </label>
        <div className="govie-hint">{t("merchantIdHint")}</div>
        <input
          type="text"
          id="merchant_id"
          name="merchant_id"
          className="govie-input"
          defaultValue={merchantId}
        />
      </div>
      <div className="govie-form-group">
        <label className="govie-label--s" htmlFor="shared_secret">
          {t("sharedSecret")}
        </label>
        <div className="govie-hint">{t("sharedSecretHint")}</div>
        <input
          type="password"
          id="shared_secret"
          name="shared_secret"
          className="govie-input"
          defaultValue={sharedSecret}
          autoComplete="off"
        />
      </div>
    </div>
  );
};
