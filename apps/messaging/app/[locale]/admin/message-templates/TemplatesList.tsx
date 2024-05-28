import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";
import { messageTemplates } from "../../../utils/routes";

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

            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              <Link
                className="govie-link govie-!-margin-right-3"
                href={(() => {
                  const url = new URL(
                    `${messageTemplates.url}/template`,
                    process.env.HOST_URL,
                  );
                  url.searchParams.append("id", template.templateMetaId);
                  url.searchParams.append("lang", "en");
                  return url.href;
                })()}
              >
                {t("list.actions.edit")}
              </Link>
              <Link
                className="govie-link govie-!-margin-right-3"
                href={(() => {
                  const url = new URL(
                    messageTemplates.url,
                    process.env.HOST_URL,
                  );
                  url.searchParams.append("delete_id", template.templateMetaId);
                  return url.href;
                })()}
              >
                {t("list.actions.delete")}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
