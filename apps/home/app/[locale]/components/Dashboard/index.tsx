import { getTranslations } from "next-intl/server";
import favicon from "../../../../public/favicon.ico";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Building Blocks",
  icons: [{ rel: "icon", url: favicon.src }],
};

// const getLinks = (environment: string, locale: string) => {
//   locale = locale || "en";
//   switch (environment) {
//     case envDevelopment:
//       return {
//         learnMoreForm: new URL(
//           `${locale}/664b6de45f7c9800231daf22`,
//           "https://www.forms.uat.gov.ie/",
//         ),
//         paymentsUrl: new URL(
//           `${locale}/info`,
//           "https://payments.dev.blocks.gov.ie/",
//         ),
//         formsUrl: new URL(locale, "https://forms.dev.blocks.gov.ie/"),
//         messagingUrl: new URL(
//           `${locale}/info`,
//           "https://messaging.dev.blocks.gov.ie",
//         ),
//         designSystemUrl: new URL("/", "https://ds.dev.blocks.gov.ie"),
//         feedbackLink: new URL(
//           `${locale}/664c61ba5f7c9800231db294`,
//           "https://www.forms.uat.gov.ie",
//         ),
//       };

//     case envStaging:
//       return {
//         learnMoreForm: new URL(
//           `${locale}/664b6de45f7c9800231daf22`,
//           "https://www.forms.uat.gov.ie/",
//         ),
//         paymentsUrl: new URL(
//           `${locale}/info`,
//           "https://payments.sta.blocks.gov.ie",
//         ),
//         formsUrl: new URL(locale, "https://forms.sta.blocks.gov.ie"),
//         messagingUrl: new URL(
//           `${locale}/info`,
//           "https://messaging.sta.blocks.gov.ie",
//         ),
//         designSystemUrl: new URL("/", "https://ds.sta.blocks.gov.ie"),
//         feedbackLink: new URL(
//           `${locale}/664c61ba5f7c9800231db294`,
//           "https://www.forms.uat.gov.ie",
//         ),
//       };

//     case envUAT:
//       return {
//         learnMoreForm: new URL(
//           `${locale}/664b6de45f7c9800231daf22`,
//           "https://www.forms.uat.gov.ie/",
//         ),
//         paymentsUrl: new URL(
//           `${locale}/info`,
//           "https://payments.uat.blocks.gov.ie",
//         ),
//         formsUrl: new URL(locale, "https://forms.uat.blocks.gov.ie"),
//         messagingUrl: new URL(
//           `${locale}/info`,
//           "https://messaging.uat.blocks.gov.ie",
//         ),
//         designSystemUrl: new URL("/", "https://ds.uat.blocks.gov.ie"),
//         feedbackLink: new URL(
//           `${locale}/664c61ba5f7c9800231db294`,
//           "https://www.forms.uat.gov.ie",
//         ),
//       };

//     case envProduction:
//     default:
//       return {
//         learnMoreForm: new URL(
//           `${locale}/664ccbf2b644d000246cfd78`,
//           "https://www.forms.gov.ie",
//         ),
//         paymentsUrl: new URL(
//           `${locale}/info`,
//           "https://payments.blocks.gov.ie",
//         ),
//         formsUrl: new URL(locale, "https://forms.blocks.gov.ie"),
//         messagingUrl: new URL(
//           `${locale}/info`,
//           "https://messaging.blocks.gov.ie",
//         ),
//         designSystemUrl: new URL("/", "https://ds.blocks.gov.ie"),
//         feedbackLink: new URL(
//           `${locale}/664ccbdb0700c50024c53899`,
//           "https://www.forms.gov.ie",
//         ),
//       };
//   }
// };

type Props = {
  locale: string;
};

export default async function ({ locale }: Props) {
  const t = await getTranslations("LandingPage");

  // const environment = String(process.env.ENVIRONMENT);
  // const links = getLinks(environment, props.params.locale);

  return <>Dashboard</>;
}
