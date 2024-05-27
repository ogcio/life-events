import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "./page.scss";
import Header from "./Header";
import Footer from "./Footer";
import { getTranslations } from "next-intl/server";

export default async function () {
  const t = await getTranslations("LandingPage");

  return (
    <>
      <Header />

      <Footer />
    </>
  );
}
