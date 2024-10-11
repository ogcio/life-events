import React from "react";
import { Heading, Icon, Label, LabelSize, Paragraph } from "@govie-ds/react";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

import { data } from "../../../data/data";
import { translate } from "../../../utils/locale";
import { getTranslations } from "next-intl/server";
import TableHeading from "../../TableHeading";
import TableSection from "../../TableSection";
import TableHeader from "../../TableHeader";
import TableNewButtonLink from "../../TableNewButtonLink";

export default async (props: { params: { locale: string } }) => {
  const [tTable, tHome] = await Promise.all([
    getTranslations("Table"),
    getTranslations("Home"),
  ]);
  const { user } = await AuthenticationFactory.getInstance().getContext();

  const tableData = await data.category.table();

  const categoryGroup: Record<string, (typeof tableData)[0][]> =
    tableData.reduce((groups, model) => {
      groups[model.categoryId]?.push(model) ??
        (groups[model.categoryId] = [model]);
      return groups;
    }, {});

  return (
    <>
      <Heading>{tHome("journeyCategoriesHeading")}</Heading>

      {Object.keys(categoryGroup).map((categoryId) => {
        return (
          <TableSection key={categoryId}>
            <TableHeading>
              <TableHeader>
                {translate(
                  categoryGroup[categoryId][0].categoryName,
                  props.params.locale,
                )}
              </TableHeader>
              <TableNewButtonLink
                href={`/${props.params.locale}/categories/${categoryId}/create-subcategory`}
              >
                {tHome("newSubcategoryLink")}
              </TableNewButtonLink>
            </TableHeading>

            <div style={{ padding: "24px" }}>
              {categoryGroup[categoryId].some((x) => !x.subcategoryId) && (
                <Paragraph align="center" style={{ margin: "0 auto" }}>
                  {tTable("noRows")}
                </Paragraph>
              )}
              {categoryGroup[categoryId].some((x) => x.subcategoryId) && (
                <table className="govie-table">
                  <thead className="govie-table__head">
                    <tr className="govie-table__row">
                      <th scope="col" className="govie-table__header">
                        {tTable("subcategory")}
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
                    {categoryGroup[categoryId].map((row) => {
                      return (
                        <tr
                          key={row.subcategoryId}
                          className="govie-table__row"
                        >
                          <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-m">
                            {translate(
                              row.subcategoryName,
                              props.params.locale,
                            )}
                          </td>
                          <td className="govie-table__cell govie-body-s govie-table__cell--numeric">
                            <a
                              className="govie-link govie-link--no-visited-state"
                              href={`/${props.params.locale}/subcategories/${row.subcategoryId}`}
                            >
                              {tTable("editAction")}
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </TableSection>
        );
      })}
    </>
  );
};
