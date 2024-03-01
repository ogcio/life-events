import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { pgpool } from "../../../dbConnection";
import { Template } from "../../../../types/template";

async function saveTemplate(formData) {
  "use server";
  const id = formData.get("id");

  const name = formData.get("name");
  const subject = formData.get("subject");
  const body = formData.get("body");

  await pgpool.query(
    "UPDATE templates SET name = $2, subject = $3, body = $4 WHERE id = $1",
    [id, name, subject, body]
  );

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
  const id = searchParams.id;
  const template = (
    await pgpool.query<Template>(`SELECT * FROM templates WHERE id= $1`, [id])
  ).rows[0];

  return (
    <main className="govie-main-wrapper" id="main-content" role="main">
      <form action={saveTemplate}>
        <h2 className="govie-heading-m">{t("form.editFormTitle")}</h2>
        <input name="id" type="hidden" defaultValue={template.id} />

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
            defaultValue={template.name}
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
            defaultValue={template.subject}
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
            defaultValue={template.body}
          ></textarea>
        </div>

        <button className="govie-button">{t("form.save")}</button>
      </form>
    </main>
  );
}
