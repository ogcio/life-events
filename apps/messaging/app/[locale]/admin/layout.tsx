import { getTranslations } from "next-intl/server";
import { messages, routes } from "../../utils";
import Footer from "../Footer";
import Header from "../Header";
import SideMenu from "../SideMenu";
import { PgSessions } from "auth/sessions";

const availableLinks = {
  DEV: {
    feedbackLink:
      "https://www.formsg.testing.gov.ie/en/664c61ba5f7c9800231db294",
  },
  STA: {
    feedbackLink:
      "https://www.formsg.testing.gov.ie/en/664c61ba5f7c9800231db294",
  },
};

export default async ({ children , params}: { children: React.ReactNode, params: { locale: string } }) => {
  const t = await getTranslations("AlphaBanner");
  //Let's hardcode Dev for now, in a separate PR - we will add an env var to handle that
  const environment = "DEV";
  const links = availableLinks[environment];
  return (
    <>
      <Header locale={params.locale}/>
      {/* All designs are made for 1440 px  */}
      <div
        className="govie-width-container"
        style={{ maxWidth: "1440px", width: "100%" }}
      >
        <div className="govie-phase-banner">
          <p className="govie-phase-banner__content">
            <strong className="govie-tag govie-phase-banner__content__tag">
              {t("tag")}
            </strong>
            <span className="govie-phase-banner__text">
              {t.rich("bannerText", {
                anchor: (chunks) => (
                  <a className="govie-link" href={links.feedbackLink}>
                    {chunks}
                  </a>
                ),
              })}
            </span>
          </p>
        </div>
        <div style={{ width: "80%", margin: "0 auto", paddingTop: "20px" }}>
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};
