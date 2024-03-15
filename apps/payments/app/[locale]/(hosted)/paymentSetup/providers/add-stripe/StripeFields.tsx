import { getTranslations } from "next-intl/server";

type Props = {
  providerName?: string;
  livePublishableKey?: string;
  liveSecretKey?: string;
};

export default async ({
  providerName = "",
  livePublishableKey = "",
  liveSecretKey = "",
}: Props) => {
  const t = await getTranslations("PaymentSetup.AddStripe");

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
        <label className="govie-label--s" htmlFor="account_number">
          {t("livePublishableKey")}{" "}
        </label>
        <div className="govie-hint">{t("livePublishableKeyHint")}</div>
        <input
          type="text"
          id="live_publishable_key"
          name="live_publishable_key"
          className="govie-input"
          defaultValue={livePublishableKey}
        />
      </div>
      <div className="govie-form-group">
        <label className="govie-label--s" htmlFor="account_number">
          {t("liveSecretKey")}{" "}
        </label>
        <div className="govie-hint">{t("liveSecretKeyHint")}</div>
        <input
          type="text"
          id="live_secret_key"
          name="live_secret_key"
          className="govie-input"
          defaultValue={liveSecretKey}
        />
      </div>
    </div>
  );
};
