import { getTranslations } from "next-intl/server";
import Footer from "../Footer";
import Header from "../Header";
import { getLinks } from "../../utils/messaging";

export default async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  const t = await getTranslations("AlphaBanner");
  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, params.locale);

  return (
    <>
      <Header locale={params.locale} />
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
                  <a className="govie-link" href={links.feedbackLink.href}>
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
