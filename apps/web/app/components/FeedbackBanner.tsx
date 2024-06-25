import { useTranslations } from "next-intl";
import {
  envDevelopment,
  envProduction,
  envStaging,
  envUAT,
} from "../utils/web";

const getLinks = (environment: string, locale: string) => {
  locale = locale || "en";
  /**
   * this switch is useless
   * but we may use it in the futur
   * to use different links for different environments
   */
  switch (environment) {
    case envUAT:
    case envStaging:
    case envDevelopment:
    case envProduction:
    default:
      return {
        feedbackLink: new URL(
          `${locale}/6669869c2fe1ff00242a1547`,
          " https://www.forms.gov.ie",
        ),
        supportLink: new URL(
          `${locale}/6663287aff870300248b6232`,
          " https://www.forms.gov.ie",
        ),
      };
  }
};

export default ({ locale }: { locale: string }) => {
  const t = useTranslations("FeedbackBanner");

  const { feedbackLink, supportLink } = getLinks(
    String(process.env.ENVIRONMENT),
    locale,
  );

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
            link1: (chunks) => (
              <a className="govie-link" href={feedbackLink.href}>
                {chunks}
              </a>
            ),
            link2: (chunks) => (
              <a className="govie-link" href={supportLink.href}>
                {chunks}
              </a>
            ),
          })}
        </span>
      </p>
    </div>
  );
};
