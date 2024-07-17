import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "../styles/globals.scss";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PgSessions } from "auth/sessions";
import { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import { headers } from "next/headers";
import { pgpool } from "../utils/postgres";
import FeedbackBanner from "../components/FeedbackBanner";
import { getAllEnabledFlags, isFeatureFlagEnabled } from "feature-flags/utils";
import {
  getEnabledOptions,
  menuOptions,
} from "../components/HamburgerMenu/options";
import HamburgerMenuWrapper from "../components/HamburgerMenu/HamburgerMenuWrapper";
import { getMessages, getTranslations } from "next-intl/server";
import styles from "./layout.module.scss";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import AnalyticsTracker from "analytics/components/AnalyticsTracker";
import favicon from "../../../public/favicon.ico";

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

  const redirectUrl = `${path}${queryString ? `?${queryString}` : ""}`;

  const { userId, firstName, lastName, publicServant, verificationLevel } =
    await PgSessions.get(redirectUrl);

  // if the requested path is not under the admin routes and the user is a publc servant, redirect to the admin page
  if (publicServant && !path?.startsWith(`/${locale}/admin`)) {
    redirect(`/${locale}/admin`, RedirectType.replace);
  }

  const userName = [firstName, lastName].join(" ");

  const result = await pgpool.query<{ is_consenting: boolean }>(
    `SELECT is_consenting FROM user_consents WHERE user_id = $1 AND agreement = 'storeUserData' LIMIT 1`,
    [userId],
  );

  const isConsenting = Boolean(result.rows.at(0)?.is_consenting);

  if (!isConsenting && !path?.endsWith("welcome")) {
    const url = new URL(`${locale}/welcome`, process.env.HOST_URL);
    url.searchParams.append("redirect_url", redirectUrl);

    redirect(url.href, RedirectType.replace);
  }

  const showHamburgerMenu =
    (await isFeatureFlagEnabled("eventsMenu")) && !publicServant;

  const enabledEntries = await getAllEnabledFlags(
    menuOptions.map((o) => o.key),
  );

  const messages = await getMessages({ locale });
  const hamburgerMenuMessages = messages.HamburgerMenu as AbstractIntlMessages;
  const hamburgerMenuT = await getTranslations("HamburgerMenu");
  const options = getEnabledOptions(locale, enabledEntries, hamburgerMenuT);

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

        {showHamburgerMenu && (
          <NextIntlClientProvider messages={hamburgerMenuMessages}>
            <HamburgerMenuWrapper
              userName={userName}
              selected={path || ""}
              options={options}
              locale={locale}
              path={path}
            />
          </NextIntlClientProvider>
        )}
        <Header showHamburgerButton={showHamburgerMenu} locale={locale} />
        {/* All designs are made for 1440 px  */}
        <main className={styles.mainContainer}>
          <FeedbackBanner locale={locale} />
          <div style={{ margin: "0 auto", paddingTop: "20px" }}>{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
