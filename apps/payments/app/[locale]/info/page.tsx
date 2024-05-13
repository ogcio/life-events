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

        <div
          className="govie-width-container"
          style={{ maxWidth: "1440px", width: "100%" }}
        >
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
                <a href="/paymentSetup">
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
                <Image src={hero} alt={t("sections.main.title")} width={500} />
              </div>
            </div>
            <div className="govie-grid-column-full">
              <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />
            </div>
            <h1 className="govie-heading-l">{t("benefits")}</h1>

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
                  width={500}
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
              <div style={{ flex: "1 1 auto", maxWidth: "700px" }}>
                <Image
                  src={security}
                  alt={t("sections.security.title")}
                  width={500}
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
                <div>
                  <Image
                    src={interfaceCitizen}
                    alt={t("sections.interface.citizenPOV")}
                    height={300}
                  />
                  <p className="govie-body">
                    {t("sections.interface.citizenPOV")}
                  </p>
                </div>
                <div>
                  <Image
                    src={interfacePublicServant}
                    alt={t("sections.interface.publicServantPOV")}
                    height={300}
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
              <a href="/paymentSetup">
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
