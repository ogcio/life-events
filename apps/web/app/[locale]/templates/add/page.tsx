import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { addTemplate } from "messages";

async function saveTemplate(formData) {
  "use server";
  const name = formData.get("name");
  const subject = formData.get("subject");
  const body = formData.get("body");

  await addTemplate(name, subject, body);

  redirect("/templates");
}
export default async () => {
  const t = await getTranslations("EmailTemplates");

  return (
    <main className="govie-main-wrapper " id="main-content" role="main">
      <form action={saveTemplate}>
        <h2 className="govie-heading-m">{t("form.addFormTitle")}</h2>

        <div className="govie-form-group">
          <div className="govie-hint" id="name-hint">
            {t("form.name")}
          </div>
          <input
            type="text"
            id="name"
            name="name"
            className="govie-input"
            aria-describedby="name-hint"
            required
          />
        </div>
        <div className="govie-form-group">
          <div className="govie-hint" id="subject-hint">
            {t("form.subject")}
          </div>
          <input
            type="text"
            id="subject"
            name="subject"
            className="govie-input"
            aria-describedby="subject-hint"
            required
          />
        </div>
        <div className="govie-form-group">
          <div className="govie-hint" id="description-hint">
            {t("form.body")}
          </div>
          <textarea
            id="body"
            name="body"
            className="govie-textarea"
            aria-describedby="body-hint"
            rows={5}
          ></textarea>
        </div>

        <button className="govie-button">{t("form.save")}</button>
      </form>
    </main>
  );
};
