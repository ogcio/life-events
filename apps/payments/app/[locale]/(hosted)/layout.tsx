import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Footer from "./Footer";
import Header from "../../components/Header/Header";
import Banner from "../../components/Banner";
import { getTranslations } from "next-intl/server";

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const t = await getTranslations("FeedbackBanner");

  return (
    <html lang={locale}>
      <body
        style={{
          margin: "unset",
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* workaround to allow Logto to cache the access token */}
        <img
          src={`${process.env.NEXT_PUBLIC_HOST_URL}/api/token`}
          style={{ display: "none" }}
        />
        <Header locale={locale} />
        <div className="width-container">
          <Banner
            tag={t("tag")}
            text={t.rich("bannerText", {
              mail: (chunks) => (
                <a
                  className="govie-link"
                  href="mailto:tiago.ramos@nearform.com?subject=Feedback"
                >
                  {chunks}
                </a>
              ),
            })}
          />
          <div className="page-container">{children}</div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
