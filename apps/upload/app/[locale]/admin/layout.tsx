import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "../../styles/globals.scss";
import FeedbackBanner from "../../components/FeedbackBanner";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import styles from "../(public)/layout.module.scss";
import { AuthenticationFactory } from "../../utils/authentication-factory";

export default async ({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  const authFactory = AuthenticationFactory.getInstance();
  await authFactory.getPublicServant();

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
        <Header
          signoutUrl="/admin/signout"
          showHamburgerButton={false}
          locale={locale}
        />
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
