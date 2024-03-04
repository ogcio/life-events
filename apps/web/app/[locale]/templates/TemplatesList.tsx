import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import {
  deleteTemplate,
  getTemplateById,
  getTemplates,
  sendFromTemplate,
} from "messages";
import Link from "next/link";
import { findParameters } from "messages/templates/utils";
import { getFeatureFlag } from "feature-flags/utils";

async function deleteTemplateAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deleteTemplate(id);
  revalidatePath("/");
}

async function sendEmail(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;

  const template = await getTemplateById(id);
  const params = findParameters(template.body);
  const paramsObj = {};
  params.forEach((param) => {
    paramsObj[param] = param + " - TEST";
  });

  await sendFromTemplate(
    {
      from: "from@test.com",
      to: "to@test.com",
    },
    id,
    paramsObj
  );

  revalidatePath("/");
}

export default async () => {
  const t = await getTranslations("EmailTemplates");
  const templates = await getTemplates();
  const testEmaileatureFlag = await getFeatureFlag("portal", "test_email");

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
                <form action={deleteTemplateAction}>
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
                {testEmaileatureFlag?.is_enabled && (
                  <form action={sendEmail}>
                    <input name="id" type="hidden" value={template.id} />
                    <button
                      id="button"
                      data-module="govie-button"
                      className="govie-button govie-button--small govie-button--tertiary"
                      type="submit"
                    >
                      Send test email
                    </button>
                  </form>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
