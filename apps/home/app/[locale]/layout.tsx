import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Banner from "./components/Banner";
import { getTranslations } from "next-intl/server";
import {
  envDevelopment,
  envProduction,
  envStaging,
  envUAT,
} from "../../constants";

const getLinks = (environment: string, locale: string) => {
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

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const t = await getTranslations("LandingPage");

  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, locale);

  return (
    <>
      <Header locale={locale} />

      <div className="govie-width-container" style={{ width: "100%" }}>
        <Banner
          tag={t("AlphaBanner.tag")}
          text={t.rich("AlphaBanner.bannerText", {
            url: (chunks) => (
              <a className="govie-link" href={links.feedbackLink.href}>
                {chunks}
              </a>
            ),
          })}
        />
      </div>

      {children}

      <Footer />
    </>
  );
}
