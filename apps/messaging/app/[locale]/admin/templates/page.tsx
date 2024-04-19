import { getTranslations } from "next-intl/server";
import TemplatesList from "./TemplatesList";
import { redirect } from "next/navigation";

export default async () => {
  const t = await getTranslations("MessageTemplates");

  async function addAction() {
    "use server";
    redirect(new URL("admin/templates/add", process.env.HOST_URL).href);
  }

  return (
    <main className="govie-main-wrapper " id="main-content" role="main">
      <h1 className="govie-heading-l">{t("title")}</h1>

      <form action={addAction}>
        <button className="govie-button">Add</button>
      </form>
      <TemplatesList />
    </main>
  );
};
