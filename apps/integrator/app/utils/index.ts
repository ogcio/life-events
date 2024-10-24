import {
  envDevelopment,
  envProduction,
  envStaging,
  envUAT,
} from "../../constants";

export const getLinks = (environment: string, locale: string) => {
  locale = locale || "en";
  switch (environment) {
    case envDevelopment:
      return {
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.forms.uat.gov.ie",
        ),
      };

    case envStaging:
      return {
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.forms.uat.gov.ie",
        ),
      };

    case envUAT:
      return {
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.forms.uat.gov.ie",
        ),
      };

    case envProduction:
    default:
      return {
        feedbackLink: new URL(
          `${locale}/664ccbdb0700c50024c53899`,
          "https://www.forms.gov.ie",
        ),
      };
  }
};
