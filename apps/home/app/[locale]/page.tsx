import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "./page.scss";
import Header from "./Header";
import Footer from "./Footer";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import hero from "../../public/landingPage/hero.png";
import payments from "../../public/landingPage/payments.png";
import messaging from "../../public/landingPage/messaging.png";
import favicon from "../../public/favicon.ico";
import designSystem from "../../public/landingPage/designSystem.png";
import forms from "../../public/landingPage/forms.png";
import type { Metadata } from "next";
import {
  envDevelopment,
  envProduction,
  envStaging,
  envUAT,
} from "../../constants";

export const metadata: Metadata = {
  title: "Building Blocks",
  icons: [{ rel: "icon", url: favicon.src }],
};

const getLinks = (environment: string, locale: string) => {
  locale = locale || "en";
  switch (environment) {
    case envDevelopment:
      return {
        learnMoreForm: new URL(
          `${locale}/664b6de45f7c9800231daf22`,
          "https://www.formsg.testing.gov.ie/",
        ),
        paymentsUrl: new URL(
          `${locale}/info`,
          "https://payments.dev.blocks.gov.ie/",
        ),
        formsUrl: new URL(locale, "https://forms.dev.blocks.gov.ie/"),
        messagingUrl: new URL(
          `${locale}/info`,
          "https://messaging.dev.blocks.gov.ie",
        ),
        designSystemUrl: new URL("/", "https://ds.dev.blocks.gov.ie"),
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.formsg.testing.gov.ie",
        ),
      };

    case envStaging:
      return {
        learnMoreForm: new URL(
          `${locale}/664b6de45f7c9800231daf22`,
          "https://www.formsg.testing.gov.ie/",
        ),
        paymentsUrl: new URL(
          `${locale}/info`,
          "https://payments.sta.blocks.gov.ie",
        ),
        formsUrl: new URL(locale, "https://forms.sta.blocks.gov.ie"),
        messagingUrl: new URL(
          `${locale}/info`,
          "https://messaging.sta.blocks.gov.ie",
        ),
        designSystemUrl: new URL("/", "https://ds.sta.blocks.gov.ie"),
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.formsg.testing.gov.ie",
        ),
      };

    case envUAT:
      return {
        learnMoreForm: new URL(
          `${locale}/664b6de45f7c9800231daf22`,
          "https://www.formsg.testing.gov.ie/",
        ),
        paymentsUrl: new URL(
          `${locale}/info`,
          "https://payments.uat.blocks.gov.ie",
        ),
        formsUrl: new URL(locale, "https://forms.uat.blocks.gov.ie"),
        messagingUrl: new URL(
          `${locale}/info`,
          "https://messaging.uat.blocks.gov.ie",
        ),
        designSystemUrl: new URL("/", "https://ds.uat.blocks.gov.ie"),
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.formsg.testing.gov.ie",
        ),
      };

    case envProduction:
    default:
      return {
        learnMoreForm: new URL(
          `${locale}/664ccbf2b644d000246cfd78`,
          "https://www.forms.gov.ie",
        ),
        paymentsUrl: new URL(
          `${locale}/info`,
          "https://payments.blocks.gov.ie",
        ),
        formsUrl: new URL(locale, "https://forms.blocks.gov.ie"),
        messagingUrl: new URL(
          `${locale}/info`,
          "https://messaging.blocks.gov.ie",
        ),
        designSystemUrl: new URL("/", "https://ds.blocks.gov.ie"),
        feedbackLink: new URL(
          `${locale}/664ccbdb0700c50024c53899`,
          "https://www.forms.gov.ie",
        ),
      };
  }
};

type Props = {
  params: {
    locale: string;
  };
};

export default async function (props: Props) {
  const t = await getTranslations("LandingPage");

  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, props.params.locale);

  return (
    <>
      <Header locale={props.params.locale} />

      <div className="govie-width-container">
        <div className="govie-phase-banner">
          <p className="govie-phase-banner__content">
            <strong className="govie-tag govie-phase-banner__content__tag">
              {t("AlphaBanner.tag")}
            </strong>
            <span className="govie-phase-banner__text">
              {t.rich("AlphaBanner.bannerText", {
                url: (chunks) => (
                  <a className="govie-link" href={links.feedbackLink.href}>
                    {chunks}
                  </a>
                ),
              })}
            </span>
          </p>
        </div>
        <hr className="govie-section-break  govie-section-break--m" />

        <div className="two-columns-layout">
          <div className="column">
            <h1 className="govie-heading-l">{t("sections.main.title")}</h1>
            <h2 className="govie-heading-m">{t("sections.main.subtitle")}</h2>

            <p className="govie-body">{t("sections.main.description")}</p>

            <hr className="govie-section-break" />
            <p className="govie-body">{t("sections.main.secondaryP1")}</p>
            <p className="govie-body">{t("sections.main.secondaryP2")}</p>

            <a href={links.learnMoreForm.href}>
              <button
                id="button"
                data-module="govie-button"
                className="govie-button govie-button--primary"
              >
                {t("sections.main.cta")}
                <svg
                  className="govie-button__icon-right"
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0.5L6.59 1.91L12.17 7.5H0V9.5H12.17L6.59 15.09L8 16.5L16 8.5L8 0.5Z"
                    fill="white"
                  ></path>
                </svg>
              </button>
            </a>
          </div>
          <div className="column">
            <Image
              src={hero}
              alt={t("sections.main.title")}
              layout="responsive"
            />
          </div>
        </div>
      </div>
      <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

      <div className="govie-width-container">
        <div className="two-columns-layout align-items-center">
          <div className="column">
            <Image
              src={forms}
              alt={t("sections.forms.title")}
              layout="responsive"
            />
          </div>
          <div className="column">
            <h2 className="govie-heading-l">{t("sections.forms.title")}</h2>

            <p className="govie-body">{t("sections.forms.description")}</p>
            <a className="govie-link" href={links.formsUrl.href}>
              {t("sections.forms.cta")}
            </a>
          </div>
        </div>
        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <div className="two-columns-layout align-items-center">
          <div className="column">
            <h2 className="govie-heading-l">{t("sections.payments.title")}</h2>

            <p className="govie-body">{t("sections.payments.description")}</p>
            <a className="govie-link" href={links.paymentsUrl.href}>
              {t("sections.payments.cta")}
            </a>
          </div>
          <div className="column">
            <Image
              src={payments}
              alt={t("sections.payments.title")}
              layout="responsive"
            />
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <div className="two-columns-layout align-items-center">
          <div className="column">
            <Image
              src={messaging}
              alt={t("sections.messaging.title")}
              layout="responsive"
            />
          </div>
          <div className="column">
            <h2 className="govie-heading-l">{t("sections.messaging.title")}</h2>

            <p className="govie-body">{t("sections.messaging.description")}</p>
            <a className="govie-link" href={links.messagingUrl.href}>
              {t("sections.messaging.cta")}
            </a>
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <div className="two-columns-layout align-items-center">
          <div className="column">
            <strong
              className="govie-tag govie-tag--green govie-phase-banner__content__tag"
              style={{
                marginBottom: "10px",
              }}
            >
              {t("sections.designSystem.inDev").toUpperCase()}
            </strong>
            <h2 className="govie-heading-l">
              {t("sections.designSystem.title")}
            </h2>

            <p className="govie-body">
              {t("sections.designSystem.description")}
            </p>
            <a className="govie-link" href={links.designSystemUrl.href}>
              {t("sections.designSystem.cta")}
            </a>
          </div>
          <div className="column">
            <Image
              src={designSystem}
              alt={t("sections.designSystem.title")}
              layout="responsive"
            />
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />
      </div>

      <div className="govie-width-container">
        <div>
          <h2 className="govie-heading-l">{t("sections.advantages.title")}</h2>
          <p className="govie-body">{t("sections.advantages.description")}</p>

          <div className="three-columns-layout">
            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.noProcurement.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.noProcurement.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.noCode.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.noCode.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.lowCost.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.lowCost.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.accessible.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.accessible.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.trustedExperience.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.trustedExperience.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.test.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.test.description")}
              </p>
            </div>
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <div>
          <h2 className="govie-heading-l">{t("sections.footer.title")}</h2>

          <p className="govie-body">{t("sections.footer.listDescription")}</p>
          <ul className="govie-list govie-list--bullet">
            <li>{t("sections.footer.listItem1")}</li>
            <li>{t("sections.footer.listItem2")}</li>
            <li>{t("sections.footer.listItem3")}</li>
          </ul>
          <p className="govie-body">{t("sections.footer.descriptionP1")}</p>
          <p className="govie-body">{t("sections.footer.descriptionP2")}</p>
          <a href={links.learnMoreForm.href}>
            <button
              id="button"
              data-module="govie-button"
              className="govie-button govie-button--primary"
            >
              {t("sections.footer.cta")}
              <svg
                className="govie-button__icon-right"
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 0.5L6.59 1.91L12.17 7.5H0V9.5H12.17L6.59 15.09L8 16.5L16 8.5L8 0.5Z"
                  fill="white"
                ></path>
              </svg>
            </button>
          </a>
        </div>
      </div>

      <hr className="govie-section-break govie-section-break govie-section-break--l" />

      <Footer />
    </>
  );
}
