import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "./Header";
import Footer from "./Footer";

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
        style={{ margin: "unset", minHeight: "100vh", position: "relative" }}
      >
        <Header />
        <div className="govie-width-container">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
