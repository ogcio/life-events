import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

async function saveTemplate(formData: FormData) {
  "use server";
  // await addEmailTemplate([
  //   {
  //     language: languages.EN,
  //     name: formData.get("name_en"),
  //     subject: formData.get("subject_en"),
  //     body: formData.get("body_en"),
  //   },
  //   {
  //     language: languages.GA,
  //     name: formData.get("name_ga"),
  //     subject: formData.get("subject_ga"),
  //     body: formData.get("body_ga"),
  //   },
  // ]);

  redirect("/templates");
}
export default async () => {
  const t = await getTranslations("MessageTemplates");
  const tLanguages = await getTranslations("Languages");

  return (
    <main className="govie-main-wrapper" role="main">
      <form action={saveTemplate}>
        <h2 className="govie-heading-m">{t("form.addFormTitle")}</h2>

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
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
              ></textarea>
            </div>
          </div>
          <div style={{ flex: 1 }}>
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
              ></textarea>
            </div>
          </div>
        </div>

        <button className="govie-button">{t("form.save")}</button>
      </form>
    </main>
  );
};
