import { getTranslations } from "next-intl/server";
import React from "react";
import TableSection from "../../TableSection";
import TableHeading from "../../TableHeading";
import TableHeader from "../../TableHeader";
import TableNewButtonLink from "../../TableNewButtonLink";

export default async function RecommendedPaths(props: {
  params: { locale: string };
}) {
  const tTable = await getTranslations("Table");
  return (
    <>
      <h1>Recommended paths</h1>

      <TableSection>
        <TableHeading>
          <TableHeader>Header</TableHeader>
          <TableNewButtonLink
            href={`/${props.params.locale}/recommended-paths/create-path`}
          >
            New path
          </TableNewButtonLink>
        </TableHeading>
        <div style={{ padding: "24px" }}>
          <table className="govie-table">
            <thead className="govie-table__head">
              <tr className="govie-table__row">
                <th scope="col" className="govie-table__header">
                  {tTable("from")}
                </th>
                <th scope="col" className="govie-table__header">
                  {tTable("to")}
                </th>
                <th
                  scope="col"
                  className="govie-table__header govie-table__header--numeric"
                >
                  {tTable("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="govie-table__body">
              <tr className="govie-table__row">
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-m">
                  from (subcategory item.title) (source dropdowns: from cat,
                  subcategory, item)
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-m">
                  to (subcategory item.title)
                </td>
                <td className="govie-table__cell govie-body-s govie-table__cell--numeric">
                  <a
                    className="govie-link govie-link--no-visited-state"
                    href={`/`}
                  >
                    {tTable("editAction")}
                  </a>
                  <a
                    className="govie-link govie-link--no-visited-state"
                    href={`/`}
                  >
                    {tTable("deleteAction")}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </TableSection>
    </>
  );
}
