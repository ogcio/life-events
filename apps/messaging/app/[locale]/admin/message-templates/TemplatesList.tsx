import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";
import {
  messageTemplates,
  templateRoutes,
  urlWithSearchParams,
} from "../../../utils/routes";

export default async (props: { locale: string }) => {
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
                href={
                  urlWithSearchParams(
                    `${props.locale}/${templateRoutes.url}`,
                    { key: "id", value: template.templateMetaId },
                    { key: "lang", value: "en" },
                  ).href
                }
              >
                {t("list.actions.edit")}
              </Link>
              <Link
                className="govie-link govie-!-margin-right-3"
                href={
                  urlWithSearchParams(
                    `${props.locale}/${messageTemplates.url}`,
                    {
                      key: "delete_id",
                      value: template.templateMetaId,
                    },
                  ).href
                }
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
