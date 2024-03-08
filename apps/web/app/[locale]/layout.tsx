import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "./Header";
import Footer from "./Footer";
import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { isInitialized } = await PgSessions.get();

  const path = headers().get("x-pathname")?.toString();
  if (!isInitialized && !path?.endsWith("welcome")) {
    const url = new URL(`${locale}/welcome`, process.env.HOST_URL);
    url.searchParams.append("redirect_url", path ?? "/");
    redirect(url.href, RedirectType.replace);
  }

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
        <Header />
        {/* All designs are made for 1440 px  */}
        <div
          className="govie-width-container"
          style={{ maxWidth: "1440px", width: "100%" }}
        >
          <div style={{ width: "80%", margin: "0 auto", paddingTop: "20px" }}>
            {children}
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
