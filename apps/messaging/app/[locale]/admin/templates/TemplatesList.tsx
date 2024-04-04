import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { deleteEmailTemplate, getEmailTemplates } from "messages";
import Link from "next/link";
import { languages } from "../../../utils/messaging";

async function deleteEmailTemplateAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deleteEmailTemplate(id);
  revalidatePath("/");
}

export default async () => {
  const t = await getTranslations("EmailTemplates");
  const templates = await getEmailTemplates(languages.EN);

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("list.name")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("list.subject")}
          </th>

          <th scope="col" className="govie-table__header">
            {t("list.actions.label")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {templates.map((template) => (
          <tr className="govie-table__row" key={template.id}>
            <th className="govie-table__header" scope="row">
              {template.name}
            </th>
            <th className="govie-table__header" scope="row">
              {template.subject}
            </th>

            <td className="govie-table__cell">
              <div style={{ display: "flex", gap: "10px" }}>
                <form action={deleteEmailTemplateAction}>
                  <input name="id" type="hidden" value={template.id} />
                  <button
                    id="button"
                    data-module="govie-button"
                    className="govie-button govie-button--small govie-button--tertiary"
                    type="submit"
                  >
                    {t("list.actions.delete")}
                  </button>
                </form>
                <Link
                  href={`/templates/edit?${new URLSearchParams({
                    id: template.id,
                  }).toString()}`}
                >
                  <button
                    data-module="govie-button"
                    className="govie-button govie-button--small govie-button--primary"
                  >
                    {t("list.actions.edit")}
                  </button>
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
