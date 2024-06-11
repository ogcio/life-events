import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "./page.scss";
import Header from "./Header";
import Footer from "./Footer";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import banner from "../../public/landingPage/banner.png";
import interfaces from "../../public/landingPage/interfaces.png";
import userFillingForm from "../../public/landingPage/user_filling_form.gif";
import paymentService1 from "../../public/landingPage/payment_service1.png";
import paymentService2 from "../../public/landingPage/payment_service2.png";
import paymentService3 from "../../public/landingPage/payment_service3.png";
import Image from "next/image";

export const metadata: Metadata = {
  title: "FormsIE",
};

const getLinks = (environment: string, locale: string) => {
  locale = locale || "en";
  switch (environment) {
    case "DEV":
    case "STA":
      return {
        feedbackLink: new URL(
          `${locale}/664c61ba5f7c9800231db294`,
          "https://www.formsg.testing.gov.ie",
        ),
        formsLink: new URL(
          `${locale}/664b6de45f7c9800231daf22`,
          "https://www.formsg.testing.gov.ie",
        ),
      };

    case "PROD":
    default:
      return {
        feedbackLink: new URL(
          `${locale}/664ccbdb0700c50024c53899`,
          "https://www.forms.gov.ie",
        ),

        formsLink: new URL(
          `${locale}/664ccbf2b644d000246cfd78`,
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
      <Header />

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

        <h1 className="govie-heading-l">{t("sections.main.title")}</h1>

        <div className="two-columns-layout">
          <div className="column">
            <p className="govie-body">{t("sections.main.description")}</p>
          </div>
          <div className="column">
            <Image
              src={banner}
              alt={t("sections.main.title")}
              layout="responsive"
            />
          </div>
        </div>
      </div>

      <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

      <div className="govie-width-container">
        <div className="two-columns-layout">
          <div className="column">
            <h2 className="govie-heading-m">{t("sections.benefits.title")}</h2>
            <h3 className="govie-heading-s">
              {t("sections.benefits.section1.title")}
            </h3>
            <p className="govie-body">
              {t("sections.benefits.section1.description")}
            </p>
          </div>
          <div className="column flex-center-items">
            <Image
              src={interfaces}
              alt={t("sections.benefits.section1.title")}
              layout="responsive"
              className="benefits--img-max-width"
            />
          </div>
        </div>

        <hr className="govie-section-break  govie-section-break--m" />

        <h3>{t("sections.benefits.section2.title")}</h3>
        <p className="govie-body">
          {t("sections.benefits.section2.description")}
        </p>

        <hr className="govie-section-break  govie-section-break--m" />

        <div className="two-columns-layout">
          <div className="column">
            <h3 className="govie-heading-s">
              {t("sections.benefits.section3.title")}
            </h3>
            <p className="govie-body">
              {t("sections.benefits.section3.description")}
            </p>
          </div>
          <div className="column">
            <Image
              src={userFillingForm}
              alt={t("sections.benefits.section3.title")}
              layout="responsive"
            />
          </div>
        </div>

        <hr className="govie-section-break  govie-section-break--m" />

        <h3 className="govie-heading-s">
          {t("sections.benefits.section4.title")}
        </h3>
        <p className="govie-body">
          {t("sections.benefits.section4.description")}
        </p>
        <div className="three-columns-layout">
          <div className="column">
            <Image
              src={paymentService1}
              alt={t("sections.benefits.section4.title")}
              layout="responsive"
            />
          </div>
          <div className="column">
            <Image
              src={paymentService2}
              alt={t("sections.benefits.section4.title")}
              layout="responsive"
            />
          </div>
          <div className="column">
            <Image
              src={paymentService3}
              alt={t("sections.benefits.section4.title")}
              layout="responsive"
            />
          </div>
        </div>

        <hr className="govie-section-break  govie-section-break--m" />

        <h3>{t("sections.benefits.section5.title")}</h3>
        <p className="govie-body">
          {t("sections.benefits.section5.description")}
        </p>

        <hr className="govie-section-break  govie-section-break--m" />

        <h3>{t("sections.benefits.section6.title")}</h3>
        <p className="govie-body">
          {t("sections.benefits.section6.description")}
        </p>
      </div>

      <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

      <div className="govie-width-container">
        <h2 className="govie-heading-m">{t("sections.getStarted.title")}</h2>
        <p className="govie-body">{t("sections.getStarted.description")}</p>
        <a href={links.formsLink.href}>
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
}
