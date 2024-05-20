import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "./page.css";
import Header from "./Header";
import Footer from "./Footer";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import hero from "../../public/landingPage/hero.png";
import payments from "../../public/landingPage/payments.png";
import messaging from "../../public/landingPage/messaging.png";
import designSystem from "../../public/landingPage/designSystem.png";

export default async function () {
  const t = await getTranslations("LandingPage");

  return (
    <>
      <Header />

      <div className="govie-width-container" style={{ maxWidth: "1440px" }}>
        <div style={{ width: "100%", margin: "0 auto", paddingTop: "40px" }}>
          <div
            style={{
              display: "flex",
              gap: "50px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 auto", maxWidth: "700px" }}>
              <h1 className="govie-heading-l">{t("sections.main.title")}</h1>

              <p className="govie-body">{t("sections.main.description")}</p>
              <a href="/">
                <button
                  id="button"
                  data-module="govie-button"
                  className="govie-button govie-button--primary"
                >
                  {t("sections.main.cta")}
                </button>
              </a>
            </div>
            <div style={{ flex: "1 1 auto", maxWidth: "700px" }}>
              <Image
                src={hero}
                alt={t("sections.main.title")}
                layout="responsive"
              />
            </div>
          </div>
        </div>
      </div>
      <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

      <div className="govie-width-container" style={{ maxWidth: "1440px" }}>
        <div style={{ width: "100%", margin: "0 auto" }}>
          <div className="govie-grid-row">
            <div className="govie-grid-column-one-half">
              <h1 className="govie-heading-l">
                {t("sections.payments.title")}
              </h1>

              <p className="govie-body">{t("sections.payments.description")}</p>
              <a className="govie-link" href="/">
                {t("sections.payments.cta")}
              </a>
            </div>
            <div className="govie-grid-column-one-half">
              <Image
                src={payments}
                alt={t("sections.payments.title")}
                layout="responsive"
              />
            </div>
          </div>

          <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

          <div className="govie-grid-row">
            <div className="govie-grid-column-one-half">
              <Image
                src={messaging}
                alt={t("sections.messaging.title")}
                layout="responsive"
              />
            </div>
            <div className="govie-grid-column-one-half">
              <h1 className="govie-heading-l">
                {t("sections.messaging.title")}
              </h1>

              <p className="govie-body">{t("sections.payments.description")}</p>
              <a className="govie-link" href="/">
                {t("sections.messaging.cta")}
              </a>
            </div>
          </div>

          <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

          <div className="govie-grid-row">
            <div className="govie-grid-column-one-half">
              <strong
                className="govie-tag govie-tag--green govie-phase-banner__content__tag"
                style={{
                  marginBottom: "10px",
                }}
              >
                {t("sections.designSystem.inDev").toUpperCase()}
              </strong>
              <h1 className="govie-heading-l">
                {t("sections.designSystem.title")}
              </h1>

              <p className="govie-body">
                {t("sections.designSystem.description")}
              </p>
              <a className="govie-link" href="/">
                {t("sections.designSystem.cta")}
              </a>
            </div>
            <div className="govie-grid-column-one-half">
              <Image
                src={designSystem}
                alt={t("sections.designSystem.title")}
                layout="responsive"
              />
            </div>
          </div>

          <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />
        </div>
      </div>

      <hr className="govie-section-break govie-section-break govie-section-break--xl" />

      <Footer />
    </>
  );
}
