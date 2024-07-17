import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "../Header";
import Footer from "../Footer";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getLinks } from "../../utils/messaging";

export const metadata: Metadata = {
  title: "Messaging",
};

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("InactivePublicServant");
  const tBanner = await getTranslations("AlphaBanner");

  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, props.params.locale);

  return (
    <>
      <Header locale={props.params.locale} />
      <div className="govie-width-container">
        <div className="govie-phase-banner">
          <p className="govie-phase-banner__content">
            <strong className="govie-tag govie-phase-banner__content__tag">
              {tBanner("tag")}
            </strong>
            <span className="govie-phase-banner__text">
              {tBanner.rich("bannerText", {
                anchor: (chunks) => (
                  <a className="govie-link" href={links.feedbackLink.href}>
                    {chunks}
                  </a>
                ),
              })}
            </span>
          </p>
        </div>

        <div
          style={{
            width: "80%",
            margin: "0 auto",
            paddingTop: "20px",
          }}
        >
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
          </div>
        </div>
      </div>
      <hr className="govie-section-break govie-section-break--xl" />
      <Footer />
    </>
  );
};
