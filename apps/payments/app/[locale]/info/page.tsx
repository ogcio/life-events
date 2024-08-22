import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "./page.scss";
import Header from "./Header";
import Footer from "./Footer";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import hero from "../../../public/landingPage/hero.png";
import integration from "../../../public/landingPage/integration.png";
import interfaceCitizen from "../../../public/landingPage/interfaceCitizen.png";
import interfacePublicServant from "../../../public/landingPage/interfacePublicServant.png";
import security from "../../../public/landingPage/security.png";
import {
  envDevelopment,
  envProduction,
  envStaging,
  envUAT,
} from "../../constants";

const getLinks = (environment: string, locale: string) => {
  locale = locale || "en";
  switch (environment) {
    case envUAT:
    case envStaging:
    case envDevelopment:
      return {
        learnMoreForm: new URL(
          `${locale}/664b6de45f7c9800231daf22`,
          "https://www.formsg.testing.gov.ie",
        ),
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

export default async (props: Props) => {
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
                anchor: (chunks) => (
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
            <p className="govie-body">{t("sections.main.description")}</p>
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

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <h2 className="govie-heading-m">{t("benefits")}</h2>

        <div className="two-columns-layout">
          <div className="column">
            <h3 className="govie-heading-s">
              {t("sections.integration.title")}
            </h3>
            <p className="govie-body">
              {t("sections.integration.description")}
            </p>
          </div>
          <div className="column">
            <Image
              src={integration}
              alt={t("sections.integration.title")}
              layout="responsive"
            />
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--m" />

        <div className="two-columns-layout">
          <div className="column">
            <h3 className="govie-heading-s">{t("sections.security.title")}</h3>
            <p className="govie-body">{t("sections.security.description")}</p>
          </div>
          <div className="column">
            <Image
              src={security}
              alt={t("sections.security.title")}
              layout="responsive"
            />
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--m" />

        <h3 className="govie-heading-m">{t("sections.interface.title")}</h3>
        <p className="govie-body">{t("sections.interface.description")}</p>

        <div className="two-columns-layout">
          <div className="column">
            <p className="govie-body govie-!-font-size-16">
              <i>{t("sections.interface.citizenPOV")}:</i>
            </p>
            <Image
              src={interfaceCitizen}
              alt={t("sections.interface.citizenPOV")}
              layout="responsive"
            />
          </div>
          <div className="column">
            <p className="govie-body govie-!-font-size-16">
              <i>{t("sections.interface.publicServantPOV")}:</i>
            </p>
            <Image
              src={interfacePublicServant}
              alt={t("sections.interface.publicServantPOV")}
              layout="responsive"
            />
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--m" />

        <h3 className="govie-heading-m">{t("sections.accessibility.title")}</h3>
        <p className="govie-body">{t("sections.accessibility.description")}</p>

        <h3 className="govie-heading-m">{t("sections.support.title")}</h3>
        <p className="govie-body">{t("sections.support.description")}</p>

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <h2 className="govie-heading-m">{t("sections.getStarted.title")}</h2>
        <p className="govie-body">{t("sections.getStarted.description")}</p>
        <a href={links.learnMoreForm.href}>
          <button
            id="button"
            data-module="govie-button"
            className="govie-button govie-button--primary"
          >
            {t("sections.getStarted.cta")}
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

      <hr className="govie-section-break govie-section-break--xl" />

      <Footer />
    </>
  );
};
