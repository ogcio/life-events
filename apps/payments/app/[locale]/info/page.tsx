import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "./Header";
import Footer from "./Footer";
import { getTranslations } from "next-intl/server";

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
        <h1 className="govie-heading-l">{t("mainSection.title")}</h1>
        <p className="govie-heading-m">{t("mainSection.description")}</p>

        <Footer />
      </body>
    </html>
  );
};
