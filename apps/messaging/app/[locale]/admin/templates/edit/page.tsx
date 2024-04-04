import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { editEmailTemplate, getEmailTemplateById } from "messages";
import { languages } from "../../../../utils/messaging";

async function saveTemplate(formData) {
  "use server";
  const id = formData.get("id");

  await editEmailTemplate(id, [
    {
      language: languages.EN,
      name: formData.get("name_en"),
      subject: formData.get("subject_en"),
      body: formData.get("body_en"),
    },
    {
      language: languages.GA,
      name: formData.get("name_ga"),
      subject: formData.get("subject_ga"),
      body: formData.get("body_ga"),
    },
  ]);
  redirect("/templates");
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const t = await getTranslations("EmailTemplates");
  const tLanguages = await getTranslations("Languages");

  const id = searchParams.id as string;
  const template = await getEmailTemplateById(id);

  const templateEN = template?.template_translations.find(
    (translation) => translation.language === "EN",
  );
  const templateGA = template?.template_translations.find(
    (translation) => translation.language === "GA",
  );

  if (!template || !templateEN || !templateGA) return null;

  return (
    <main className="govie-main-wrapper" id="main-content" role="main">
      <form action={saveTemplate}>
        <h2 className="govie-heading-m">{t("form.editFormTitle")}</h2>
        <input name="id" type="hidden" defaultValue={template.id} />

        <div style={{ display: "flex", gap: "20px" }}>
          <div>
            <h3 className="govie-heading-m">{tLanguages("english")}</h3>

            <div className="govie-form-group">
              <div className="govie-hint" id="name_en-hint">
                {t("form.name")}
              </div>
              <input
                type="text"
                id="name_en"
                name="name_en"
                className="govie-input"
                aria-describedby="name_en-hint"
                required
                defaultValue={templateEN.name}
              />
            </div>
            <div className="govie-form-group">
              <div className="govie-hint" id="subject_en-hint">
                {t("form.subject")}
              </div>
              <input
                type="text"
                id="subject_en"
                name="subject_en"
                className="govie-input"
                aria-describedby="subject_en-hint"
                required
                defaultValue={templateEN.subject}
              />
            </div>
            <div className="govie-form-group">
              <div className="govie-hint" id="description_en-hint">
                {t("form.body")}
              </div>
              <textarea
                id="body_en"
                name="body_en"
                className="govie-textarea"
                aria-describedby="body_en-hint"
                rows={5}
                defaultValue={templateEN.body}
              ></textarea>
            </div>
          </div>

          <div>
            <h3 className="govie-heading-m">{tLanguages("irish")}</h3>

            <div className="govie-form-group">
              <div className="govie-hint" id="name_ga-hint">
                {t("form.name")}
              </div>
              <input
                type="text"
                id="name_ga"
                name="name_ga"
                className="govie-input"
                aria-describedby="name_ga-hint"
                required
                defaultValue={templateGA.name}
              />
            </div>
            <div className="govie-form-group">
              <div className="govie-hint" id="subject_ga-hint">
                {t("form.subject")}
              </div>
              <input
                type="text"
                id="subject_ga"
                name="subject_ga"
                className="govie-input"
                aria-describedby="subject_ga-hint"
                required
                defaultValue={templateGA.subject}
              />
            </div>
            <div className="govie-form-group">
              <div className="govie-hint" id="description_ga-hint">
                {t("form.body")}
              </div>
              <textarea
                id="body_ga"
                name="body_ga"
                className="govie-textarea"
                aria-describedby="body_ga-hint"
                rows={5}
                defaultValue={templateGA.body}
              ></textarea>
            </div>
          </div>
        </div>

        <button className="govie-button">{t("form.save")}</button>
      </form>
    </main>
  );
}
