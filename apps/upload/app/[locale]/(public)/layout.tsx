import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "../../styles/globals.scss";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { PgSessions } from "auth/sessions";
import { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import { headers } from "next/headers";
import { pgpool } from "../../utils/postgres";
import FeedbackBanner from "../../components/FeedbackBanner";
import { getAllEnabledFlags, isFeatureFlagEnabled } from "feature-flags/utils";
import {
  getEnabledOptions,
  menuOptions,
} from "../../components/HamburgerMenu/options";
import HamburgerMenuWrapper from "../../components/HamburgerMenu/HamburgerMenuWrapper";
import { getMessages, getTranslations } from "next-intl/server";
import styles from "./layout.module.scss";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import AnalyticsTracker from "analytics/components/AnalyticsTracker";
import favicon from "../../../public/favicon.ico";
import { AuthSession } from "auth/auth-session";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import hasCitizenPermissions from "./utils/hasCitizenPermissions";

export const metadata: Metadata = {
  title: "Life events",
  icons: [
    {
      rel: "icon",
      url: favicon.src,
    },
  ],
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const path = headers().get("x-pathname")?.toString();
  const queryString = headers().get("x-searchParams")?.toString();
  const authFactory = AuthenticationFactory.getInstance();

  if (await authFactory.isPublicServantAuthenticated()) {
    redirect(`/${locale}/admin`, RedirectType.replace);
  }

  const context = await authFactory.getContext();

  const hasPermissions = hasCitizenPermissions(
    context.accessToken as string,
    context.scopes,
  );

  const {
    user: { id: userId },
  } = context;

  //TODO: IMPLEMENT ACTUAL VERIFICATION LEVEL FROM PROFILE API
  const verificationLevel = 2;

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
        <AnalyticsTracker
          userId={userId}
          customDimensions={{ dimension1: verificationLevel }}
        />

        <Header showHamburgerButton={false} locale={locale} />
        {/* All designs are made for 1440 px  */}
        <main className={styles.mainContainer}>
          <FeedbackBanner locale={locale} />
          <div style={{ margin: "0 auto", paddingTop: "20px" }}>
            {!hasPermissions ? (
              <h3 className="govie-heading-m">
                MISSING PERMISSIONS FOR THIS APP
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
}
