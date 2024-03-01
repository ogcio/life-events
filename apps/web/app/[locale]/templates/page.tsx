import { getTranslations } from "next-intl/server";
import TemplatesList from "./TemplatesList";

export default async () => {
  const t = await getTranslations("EmailTemplates");

  return (
    <main className="govie-main-wrapper " id="main-content" role="main">
      <h1 className="govie-heading-l">{t("title")}</h1>
      <TemplatesList />
    </main>
  );
};
