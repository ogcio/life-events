import { getTranslations } from "next-intl/server";
import ProviderTypeCard from "./ProviderTypeCard";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddProvider");

  return (
    <div>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <p className="govie-body">{t("description")}</p>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("selectHint")}</h1>
      </legend>

      <ProviderTypeCard
        title={t("openbanking")}
        description={t("openbankingDescription")}
        href={"add-openbanking"}
      />
      <ProviderTypeCard
        title={t("banktransfer")}
        description={t("banktransferDescription")}
        href={"add-banktransfer"}
      />
      <ProviderTypeCard
        title={t("stripe")}
        description={t("stripeDescription")}
        href={"add-stripe"}
      />
      {/* TODO: restore worldpay once it's integrated */}
      {/* <ProviderTypeCard
        title={t("worldpay")}
        description={t("worldpayDescription")}
        href={"add-worldpay"}
      /> */}
      <ProviderTypeCard
        title={t("realex")}
        description={t("realexDescription")}
        href={"add-realex"}
      />
    </div>
  );
};
