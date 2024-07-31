import { useTranslations } from "next-intl";
import {
  envDevelopment,
  envProduction,
  envStaging,
  envUAT,
} from "../utils/web";

const getLinks = (environment: string, locale: string) => {
  locale = locale || "en";
  switch (environment) {
    case envProduction:
      return {
        feedbackLink: new URL(
          `${locale}/form/45084-government-digital-wallet-pilot-feedback-form`,
          "https://www.gov.ie",
        ),
        supportLink: new URL(
          `${locale}/6663287aff870300248b6232`,
          "https://www.forms.gov.ie",
        ),
      };
    case envUAT:
    case envStaging:
    case envDevelopment:
    default:
      return {
        feedbackLink: new URL(
          `admin/form/6697d983d7001c0023fd87de`,
          "https://forms.preprod.gov.ie",
        ),
        supportLink: new URL(
          `${locale}/6663287aff870300248b6232`,
          "https://www.forms.gov.ie",
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
