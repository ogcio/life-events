import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeedbackBanner from "../components/FeedbackBanner";
import styles from "./layout.module.scss";

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
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
        <Header locale={locale} />
        {/* All designs are made for 1440 px  */}
        <div className={styles.mainContainer}>
          <FeedbackBanner />
          <div style={{ margin: "0 auto", paddingTop: "20px" }}>{children}</div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
