import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "../../styles/globals.scss";
import FeedbackBanner from "../../components/FeedbackBanner";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import styles from "../(public)/layout.module.scss";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import hasAdminPermissions from "./utils/hasAdminPermissions";
import { redirect, RedirectType } from "next/navigation";

export default async ({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  const authFactory = AuthenticationFactory.getInstance();
  const context = await authFactory.getContext();

  if (!context.isPublicServant) {
    return redirect("/", RedirectType.replace);
  }

  const publicServancContext = await authFactory.getPublicServant();

  // const hasPermissions = hasAdminPermissions(
  //   context.accessToken as string,
  //   context.scopes,
  // );

  const hasPermissions = true;

  return (
    <html lang={locale}>
      <head>
        <title>Upload App</title>
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
          <div style={{ margin: "0 auto", paddingTop: "20px" }}>
            {!hasPermissions ? (
              <h3 className="govie-heading-m">
                Missing permission to check this page please contact...
              </h3>
            ) : (
              children
            )}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
};
