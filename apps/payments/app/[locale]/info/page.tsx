import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "./Header";
import Footer from "./Footer";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import hero from "../../../public/landingPage/hero.png";
import integration from "../../../public/landingPage/integration.png";
import interfaceCitizen from "../../../public/landingPage/interfaceCitizen.png";
import interfacePublicServant from "../../../public/landingPage/interfacePublicServant.png";
import security from "../../../public/landingPage/security.png";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("LandingPage");

  return (
    <html lang={props.params.locale}>
      <body
        style={{
          margin: "unset",
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <div className="width-container">
          <div className="govie-phase-banner">
            <p className="govie-phase-banner__content">
              <strong className="govie-tag govie-phase-banner__content__tag">
                {t("AlphaBanner.tag")}
              </strong>
              <span className="govie-phase-banner__text">
                {t.rich("AlphaBanner.bannerText", {
                  anchor: (chunks) => (
                    <a
                      className="govie-link"
                      href={`${process.env.NEXT_PUBLIC_FORMS_URL}${props.params.locale}/664c61ba5f7c9800231db294`}
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </span>
            </p>
          </div>
          <div style={{ width: "100%", margin: "0 auto", paddingTop: "40px" }}>
            <div
              style={{
                display: "flex",
                gap: "50px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 auto", maxWidth: "700px" }}>
                <h1 className="govie-heading-l">
                  {t("sections.main.serviceName")}
                </h1>

                <h2 className="govie-heading-l">{t("sections.main.title")}</h2>
                <p className="govie-body">{t("sections.main.description")}</p>
                <a
                  href={`${process.env.NEXT_PUBLIC_FORMS_URL}${props.params.locale}/664b6de45f7c9800231daf22`}
                >
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
            <div className="govie-grid-column-full">
              <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />
            </div>
            <h2 className="govie-heading-l">{t("benefits")}</h2>

            <div
              style={{
                display: "flex",
                gap: "50px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 auto", maxWidth: "700px" }}>
                <h2 className="govie-heading-m">
                  {t("sections.integration.title")}
                </h2>
                <p className="govie-body">
                  {t("sections.integration.description")}
                </p>
              </div>
              <div style={{ flex: "1 1 auto", maxWidth: "500px" }}>
                <Image
                  src={integration}
                  alt={t("sections.integration.title")}
                  layout="responsive"
                />
              </div>
            </div>

            <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

            <div
              style={{
                display: "flex",
                gap: "50px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 auto", maxWidth: "700px" }}>
                <h2 className="govie-heading-m">
                  {t("sections.security.title")}
                </h2>
                <p className="govie-body">
                  {t("sections.security.description")}
                </p>
              </div>
              <div style={{ flex: "1 1 auto", maxWidth: "500px" }}>
                <Image
                  src={security}
                  alt={t("sections.security.title")}
                  layout="responsive"
                />
              </div>
            </div>

            <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

            <div>
              <div>
                <h2 className="govie-heading-m">
                  {t("sections.interface.title")}
                </h2>
                <p className="govie-body">
                  {t("sections.interface.description")}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "50px",
                  flexWrap: "wrap",
                  justifyContent: "space-around",
                }}
              >
                <div style={{ flex: "1 1 auto", maxWidth: "400px" }}>
                  <Image
                    src={interfaceCitizen}
                    alt={t("sections.interface.citizenPOV")}
                    layout="responsive"
                  />
                  <p className="govie-body">
                    {t("sections.interface.citizenPOV")}
                  </p>
                </div>
                <div style={{ flex: "1 1 auto", maxWidth: "400px" }}>
                  <Image
                    src={interfacePublicServant}
                    alt={t("sections.interface.publicServantPOV")}
                    layout="responsive"
                  />
                  <p className="govie-body">
                    {t("sections.interface.publicServantPOV")}
                  </p>
                </div>
              </div>
            </div>

            <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

            <div>
              <h2 className="govie-heading-m">
                {t("sections.accessibility.title")}
              </h2>
              <p className="govie-body">
                {t("sections.accessibility.description")}
              </p>
            </div>
            <div>
              <h2 className="govie-heading-m">{t("sections.support.title")}</h2>
              <p className="govie-body">{t("sections.support.description")}</p>
            </div>

            <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

            <div>
              <h2 className="govie-heading-l">
                {t("sections.getStarted.title")}
              </h2>
              <p className="govie-body">
                {t("sections.getStarted.description")}
              </p>
              <a
                href={`${process.env.NEXT_PUBLIC_FORMS_URL}${props.params.locale}/664b6de45f7c9800231daf22`}
              >
                <button
                  id="button"
                  data-module="govie-button"
                  className="govie-button govie-button--primary"
                >
                  {t("sections.getStarted.cta")}
                </button>
              </a>
            </div>
          </div>
        </div>

        <hr className="govie-section-break govie-section-break govie-section-break--xl" />

        <Footer />
      </body>
    </html>
  );
};
