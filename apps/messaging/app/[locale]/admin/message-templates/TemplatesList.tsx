import { getTranslations } from "next-intl/server";
import Link from "next/link";

import {
  messageTemplates,
  templateRoutes,
  urlWithSearchParams,
} from "../../../utils/routes";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

export default async (props: { locale: string }) => {
  const t = await getTranslations("MessageTemplates");

  const { data: templates } = await (
    await AuthenticationFactory.getMessagingClient()
  ).getTemplates();

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("list.name")}
          </th>

          <th scope="col" className="govie-table__header">
            {t("list.languages")}
          </th>

          <th scope="col" className="govie-table__header">
            {t("list.actions.label")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {templates?.map((template) => (
          <tr className="govie-table__row" key={template.id}>
            <th className="govie-table__header" scope="row">
              {template.contents.find(
                (content) => content.language === props.locale,
              )?.templateName || template.contents.at(0)?.templateName}
            </th>

            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {template.contents
                .map((content) => content.language)
                .sort()
                .join(", ")}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              <Link
                className="govie-link govie-!-margin-right-3"
                href={
                  urlWithSearchParams(`${props.locale}/${templateRoutes.url}`, {
                    key: "id",
                    value: template.id,
                  }).href
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
                      value: template.id,
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
