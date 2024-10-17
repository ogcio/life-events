import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <>
      <Header locale={locale} />
      <div className="width-container">
        <div className="page-container">{children}</div>
      </div>
      <Footer />
    </>
  );
}
