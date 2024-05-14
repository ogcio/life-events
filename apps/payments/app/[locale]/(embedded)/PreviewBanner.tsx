import { useTranslations } from "next-intl";

export default () => {
  const t = useTranslations("PreviewBanner");
  return (
    <div
      className="govie-phase-banner"
      style={{ width: "80%", margin: "0 auto" }}
    >
      <p className="govie-phase-banner__content">
        <strong className="govie-tag govie-phase-banner__content__tag">
          {t("tag")}
        </strong>
        <span className="govie-phase-banner__text">{t("bannerText")}</span>
      </p>
    </div>
  );
};
