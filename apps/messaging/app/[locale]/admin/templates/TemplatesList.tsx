import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { deleteEmailTemplate } from "messages";
import Link from "next/link";
import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";

async function deleteEmailTemplateAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const { userId } = await PgSessions.get();
  await new Messaging(userId).deleteTemplate(id);
  revalidatePath("/");
}

export default async () => {
  const t = await getTranslations("MessageTemplates");
  const { userId } = await PgSessions.get();

  const { data: templates } = await new Messaging(userId).getTemplates();

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("list.name")}
          </th>

          <th scope="col" className="govie-table__header">
            {t("list.actions.label")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {templates?.map((template) => (
          <tr className="govie-table__row" key={template.templateMetaId}>
            <th className="govie-table__header" scope="row">
              {template.templateName}
            </th>

            <td className="govie-table__cell">
              <div style={{ display: "flex", gap: "10px" }}>
                <form action={deleteEmailTemplateAction}>
                  <input
                    name="id"
                    type="hidden"
                    value={template.templateMetaId}
                  />
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
                  href={`/admin/templates/template?${new URLSearchParams({
                    id: template.templateMetaId,
                    lang: "en",
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
