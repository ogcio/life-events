import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "./Header";
import Footer from "./Footer";
import FeedbackBanner from "./FeedbackBanner";

export default function RootLayout({
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
        <Header />
        {/* All designs are made for 1440 px  */}
        <div
          className="govie-width-container"
          style={{ maxWidth: "1440px", width: "100%" }}
        >
          <FeedbackBanner />
          <div style={{ width: "80%", margin: "0 auto", paddingTop: "20px" }}>
            {children}
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
