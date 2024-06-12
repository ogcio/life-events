import { useTranslations } from "next-intl";

const getLinks = (environment: string, locale: string) => {
  locale = locale || "en";
  switch (environment) {
    case "UAT":
    case "STA":
    case "DEV":
      return {
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.formsg.testing.gov.ie",
        ),
      };

    case "PROD":
    default:
      return {
        feedbackLink: new URL(
          `en/form/935b1-government-digital-wallet-pilot-support-form/`,
          "https://www.gov.ie",
        ),
      };
  }
};

export default ({ locale }: { locale: string }) => {
  const t = useTranslations("FeedbackBanner");
  return (
    <div className="govie-phase-banner">
      <p
        className="govie-phase-banner__content"
        style={{ display: "flex", alignItems: "center" }}
      >
        <strong className="govie-tag govie-phase-banner__content__tag">
          {t("tag")}
        </strong>
        <span className="govie-phase-banner__text">
          {t.rich("bannerText", {
            mail: (chunks) => (
              <a
                className="govie-link"
                href={
                  getLinks(String(process.env.ENVIRONMENT), locale).feedbackLink
                    .href
                }
              >
                {chunks}
              </a>
            ),
          })}
        </span>
      </p>
    </div>
  );
};
