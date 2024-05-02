import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "../styles/globals.scss";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PgSessions } from "auth/sessions";
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
import { getTranslations } from "next-intl/server";
import styles from "./layout.module.scss";

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { userId, firstName, lastName } = await PgSessions.get();

  const userName = [firstName, lastName].join(" ");

  const result = await pgpool.query<{ isInitialized: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM user_consents WHERE user_id = $1 AND agreement = 'storeUserData' LIMIT 1) AS "isInitialized"`,
    [userId],
  );

  const isInitialized = Boolean(result.rows.at(0)?.isInitialized);

  const path = headers().get("x-pathname")?.toString();
  if (!isInitialized && !path?.endsWith("welcome")) {
    const url = new URL(`${locale}/welcome`, process.env.HOST_URL);
    url.searchParams.append("redirect_url", path ?? "/");
    redirect(url.href, RedirectType.replace);
  }

  const showHamburgerMenu = await isFeatureFlagEnabled("eventsMenu");

  const enabledEntries = await getAllEnabledFlags(
    menuOptions.map((o) => o.key),
  );
  const eventsMenuT = await getTranslations("EventsMenu");
  const options = getEnabledOptions(locale, enabledEntries, eventsMenuT);

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
        {showHamburgerMenu && (
          <HamburgerMenuWrapper
            userName={userName}
            selected={path || ""}
            options={options}
            locale={locale}
          />
        )}
        <Header showHamburgerButton={showHamburgerMenu} locale={locale} />
        {/* All designs are made for 1440 px  */}
        <main className={styles.main}>
          <FeedbackBanner />
          <div style={{ margin: "0 auto", paddingTop: "20px" }}>{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
