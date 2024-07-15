import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "../../styles/globals.scss";
import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";
import FeedbackBanner from "../../components/FeedbackBanner";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import styles from "../(public)/layout.module.scss";

export default async ({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  const { publicServant } = await PgSessions.get();

  if (!publicServant) {
    return redirect("/", RedirectType.replace);
  }

  return (
    <html lang={locale}>
      <head>
        <title>Life Events App</title>
      </head>
      <body
        style={{
          margin: "unset",
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header showHamburgerButton={false} locale={locale} />
        {/* All designs are made for 1440 px  */}
        <main className={styles.mainContainer}>
          <FeedbackBanner locale={locale} />
          <div style={{ margin: "0 auto", paddingTop: "20px" }}>{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
};
