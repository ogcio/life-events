import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import { getTranslations } from "next-intl/server";
import Header from "./[locale]/(hosted)/Header";
import Footer from "./[locale]/(hosted)/Footer";

export default async function () {
  const t = await getTranslations("NotFound");
  return (
    <>
      <Header />
      <div
        className="govie-width-container"
        style={{ maxWidth: "1440px", width: "100%" }}
      >
        <div style={{ width: "80%", margin: "0 auto", paddingTop: "20px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
            }}
          >
            <h2 className="govie-heading-m">{t("title")}</h2>
            <p className="govie-body">{t("description")}</p>
            <a href="/">
              <button className="govie-button govie-button--primary">
                {t("return-home")}
              </button>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
