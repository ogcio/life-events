import {
  envDevelopment,
  envProduction,
  envStaging,
  envUAT,
} from "../constants";

export const getLinks = (environment: string, locale: string) => {
  locale = locale || "en";
  switch (environment) {
    case envDevelopment:
      return {
        learnMoreForm: new URL(
          `${locale}/664b6de45f7c9800231daf22`,
          "https://www.forms.uat.gov.ie/",
        ),
        paymentsUrl: new URL(`${locale}/payments`, "https://dev.blocks.gov.ie"),
        formsUrl: new URL(locale, "https://forms.dev.blocks.gov.ie/"),
        messagingUrl: new URL(
          `${locale}/messaging`,
          "https://dev.blocks.gov.ie",
        ),
        designSystemUrl: new URL("/", "https://ds.dev.blocks.gov.ie"),
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.forms.uat.gov.ie",
        ),
        homePageUrl: new URL("", "https://dev.blocks.gov.ie"),
      };

    case envStaging:
      return {
        learnMoreForm: new URL(
          `${locale}/664b6de45f7c9800231daf22`,
          "https://www.forms.uat.gov.ie/",
        ),
        paymentsUrl: new URL(`${locale}/payments`, "https://sta.blocks.gov.ie"),
        formsUrl: new URL(locale, "https://forms.sta.blocks.gov.ie/"),
        messagingUrl: new URL(
          `${locale}/messaging`,
          "https://sta.blocks.gov.ie",
        ),
        designSystemUrl: new URL("/", "https://ds.sta.blocks.gov.ie"),
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.forms.uat.gov.ie",
        ),
        homePageUrl: new URL("", "https://sta.blocks.gov.ie"),
      };

    case envUAT:
      return {
        learnMoreForm: new URL(
          `${locale}/664b6de45f7c9800231daf22`,
          "https://www.forms.uat.gov.ie/",
        ),
        paymentsUrl: new URL(`${locale}/payments`, "https://uat.blocks.gov.ie"),
        formsUrl: new URL(locale, "https://forms.uat.blocks.gov.ie/"),
        messagingUrl: new URL(
          `${locale}/messaging`,
          "https://uat.blocks.gov.ie",
        ),
        designSystemUrl: new URL("/", "https://ds.uat.blocks.gov.ie"),
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.forms.uat.gov.ie",
        ),
        homePageUrl: new URL("", "https://uat.blocks.gov.ie"),
      };

    case envProduction:
    default:
      return {
        learnMoreForm: new URL(
          `${locale}/664ccbf2b644d000246cfd78`,
          "https://www.forms.gov.ie",
        ),
        paymentsUrl: new URL(`${locale}/payments`, "https://blocks.gov.ie"),
        formsUrl: new URL(locale, "https://forms.blocks.gov.ie/"),
        messagingUrl: new URL(`${locale}/messaging`, "https://blocks.gov.ie"),
        designSystemUrl: new URL("/", "https://ds.blocks.gov.ie"),
        feedbackLink: new URL(
          `${locale}/664ccbdb0700c50024c53899`,
          "https://www.forms.gov.ie",
        ),
        homePageUrl: new URL("", "https://blocks.gov.ie"),
      };
  }
};
